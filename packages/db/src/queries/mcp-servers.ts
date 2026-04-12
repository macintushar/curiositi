import db from "../client";
import { mcpServers } from "../schema";
import { eq, and, desc } from "drizzle-orm";
import logger from "@curiositi/share/logger";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const keyCache = new Map<string, Promise<CryptoKey>>();

function toBase64(bytes: Uint8Array): string {
	return Buffer.from(bytes).toString("base64");
}

function fromBase64(value: string): Uint8Array {
	return new Uint8Array(Buffer.from(value, "base64"));
}

function getEncryptionKey(encryptionSecret: string): string {
	if (!encryptionSecret) {
		throw new Error("Encryption secret must be configured");
	}
	return `mcp-headers:v1:${encryptionSecret}`;
}

function normalizeHeaders(raw: unknown): Record<string, string> {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		return {};
	}

	const entries = Object.entries(raw as Record<string, unknown>).filter(
		([key, value]) => typeof key === "string" && typeof value === "string"
	);

	return Object.fromEntries(entries);
}

async function getAesKey(secret: string): Promise<CryptoKey> {
	const cached = keyCache.get(secret);
	if (cached) return cached;

	const keyPromise = (async () => {
		const digest = await crypto.subtle.digest(
			"SHA-256",
			textEncoder.encode(secret)
		);
		return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, [
			"encrypt",
			"decrypt",
		]);
	})();

	keyCache.set(secret, keyPromise);
	return keyPromise;
}

async function encryptHeaders(
	headers: Record<string, string> | undefined,
	encryptionSecret: string
): Promise<string | null> {
	if (!headers || Object.keys(headers).length === 0) {
		return null;
	}

	const secret = getEncryptionKey(encryptionSecret);
	const key = await getAesKey(secret);
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const payload = textEncoder.encode(JSON.stringify(headers));
	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		payload
	);

	return `${toBase64(iv)}.${toBase64(new Uint8Array(encrypted))}`;
}

async function decryptHeaders(
	encrypted: string | null,
	legacyHeaders: unknown,
	encryptionSecret: string
): Promise<Record<string, string>> {
	if (!encrypted) {
		return normalizeHeaders(legacyHeaders);
	}

	const secret = getEncryptionKey(encryptionSecret);
	const key = await getAesKey(secret);
	const parts = encrypted.split(".");
	if (parts.length !== 2) {
		throw new Error("Invalid encrypted headers payload");
	}

	const iv = fromBase64(parts[0] ?? "");
	const ciphertext = fromBase64(parts[1] ?? "");
	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		key,
		ciphertext
	);

	const parsed = JSON.parse(textDecoder.decode(decrypted)) as unknown;
	return normalizeHeaders(parsed);
}

async function hydrateMcpServerRow<
	T extends {
		id: string;
		headers: unknown;
		headersEncrypted: string | null;
	},
>(
	row: T,
	encryptionSecret: string
): Promise<T & { headers: Record<string, string> }> {
	const legacyHeaders = normalizeHeaders(row.headers);
	const hasLegacyHeaders = Object.keys(legacyHeaders).length > 0;

	if (!row.headersEncrypted && hasLegacyHeaders) {
		try {
			const encryptedHeaders = await encryptHeaders(
				legacyHeaders,
				encryptionSecret
			);
			if (encryptedHeaders) {
				await db
					.update(mcpServers)
					.set({ headers: null, headersEncrypted })
					.where(eq(mcpServers.id, row.id));
			}
		} catch (error) {
			logger.error(
				`[MCP] Failed to migrate legacy headers for server ${row.id}:`,
				error
			);
		}
	}

	const headers = await decryptHeaders(
		row.headersEncrypted,
		legacyHeaders,
		encryptionSecret
	);
	return {
		...row,
		headers,
	};
}

export async function getActiveMcpServers(
	organizationId: string,
	encryptionSecret: string
) {
	const rows = await db
		.select()
		.from(mcpServers)
		.where(
			and(
				eq(mcpServers.organizationId, organizationId),
				eq(mcpServers.isActive, true)
			)
		)
		.orderBy(desc(mcpServers.createdAt));

	return Promise.all(
		rows.map((row) => hydrateMcpServerRow(row, encryptionSecret))
	);
}

export async function getAllMcpServers(
	organizationId: string,
	encryptionSecret: string
) {
	const rows = await db
		.select()
		.from(mcpServers)
		.where(eq(mcpServers.organizationId, organizationId))
		.orderBy(desc(mcpServers.createdAt));

	return Promise.all(
		rows.map((row) => hydrateMcpServerRow(row, encryptionSecret))
	);
}

export async function getMcpServerById(id: string, encryptionSecret: string) {
	const [server] = await db
		.select()
		.from(mcpServers)
		.where(eq(mcpServers.id, id))
		.limit(1);

	if (!server) {
		return null;
	}

	return hydrateMcpServerRow(server, encryptionSecret);
}

export async function createMcpServer(data: {
	name: string;
	url: string;
	headers?: Record<string, string>;
	organizationId: string;
	encryptionSecret: string;
}) {
	const encryptedHeaders = await encryptHeaders(
		data.headers,
		data.encryptionSecret
	);

	const [server] = await db
		.insert(mcpServers)
		.values({
			name: data.name,
			url: data.url,
			headers: null,
			headersEncrypted: encryptedHeaders,
			organizationId: data.organizationId,
			isActive: true,
		})
		.returning();

	return hydrateMcpServerRow(server, data.encryptionSecret);
}

export async function updateMcpServer(
	id: string,
	data: Partial<{
		name: string;
		url: string;
		headers: Record<string, string>;
		isActive: boolean;
		discoveredTools: number;
		lastConnectedAt: Date;
	}>,
	encryptionSecret: string
) {
	const updateData: Partial<{
		name: string;
		url: string;
		headers: null;
		headersEncrypted: string | null;
		isActive: boolean;
		discoveredTools: number;
		lastConnectedAt: Date;
	}> = {
		...data,
	};

	if (Object.hasOwn(data, "headers")) {
		updateData.headers = null;
		updateData.headersEncrypted = await encryptHeaders(
			data.headers,
			encryptionSecret
		);
		delete (updateData as { headers?: unknown }).headers;
	}

	const [updated] = await db
		.update(mcpServers)
		.set(updateData)
		.where(eq(mcpServers.id, id))
		.returning();

	return updated ? hydrateMcpServerRow(updated, encryptionSecret) : null;
}

export async function deleteMcpServer(id: string) {
	await db
		.update(mcpServers)
		.set({ isActive: false })
		.where(eq(mcpServers.id, id));
}
