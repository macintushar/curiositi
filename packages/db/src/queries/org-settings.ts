import db from "../client";
import { organizationSettings } from "../schema";
import { eq, and } from "drizzle-orm";

export async function getOrgSetting(organizationId: string, key: string) {
	const [setting] = await db
		.select()
		.from(organizationSettings)
		.where(
			and(
				eq(organizationSettings.organizationId, organizationId),
				eq(organizationSettings.key, key)
			)
		)
		.limit(1);
	return setting ?? null;
}

export async function setOrgSetting(
	organizationId: string,
	key: string,
	value: unknown
) {
	const existing = await getOrgSetting(organizationId, key);

	if (existing) {
		const [updated] = await db
			.update(organizationSettings)
			.set({ value: value as never })
			.where(
				and(
					eq(organizationSettings.organizationId, organizationId),
					eq(organizationSettings.key, key)
				)
			)
			.returning();
		return updated;
	}

	const [created] = await db
		.insert(organizationSettings)
		.values({
			organizationId,
			key,
			value: value as never,
		})
		.returning();
	return created;
}

export async function getOrgSettings(organizationId: string) {
	return db
		.select()
		.from(organizationSettings)
		.where(eq(organizationSettings.organizationId, organizationId));
}

export async function deleteOrgSetting(organizationId: string, key: string) {
	await db
		.delete(organizationSettings)
		.where(
			and(
				eq(organizationSettings.organizationId, organizationId),
				eq(organizationSettings.key, key)
			)
		);
}
