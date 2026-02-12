import { mock } from "bun:test";

// We need specific control over some methods, so we'll define them explicitly
// but fall back to the proxy strategy for dynamic chaining if needed.
// However, to keep it simple and testable, let's stick to the explicit object
// but ensure we can reset it easily.

export const mockDb = {
	select: mock(() => mockDb),
	from: mock(() => mockDb),
	where: mock(() => mockDb),
	innerJoin: mock(() => mockDb),
	leftJoin: mock(() => mockDb),
	insert: mock(() => mockDb),
	values: mock(() => mockDb),
	returning: mock(() => mockDb),
	update: mock(() => mockDb),
	set: mock(() => mockDb),
	delete: mock(() => mockDb),
	transaction: mock((cb: (tx: any) => any) => cb(mockDb)),
	execute: mock(() => mockDb),
	limit: mock(() => mockDb),
	offset: mock(() => mockDb),
	orderBy: mock(() => mockDb),
} as any;

// Helper to reset all db mocks to their default "return self" behavior
export const resetDbMocks = () => {
	const methods = [
		"select",
		"from",
		"where",
		"innerJoin",
		"leftJoin",
		"insert",
		"values",
		"returning",
		"update",
		"set",
		"delete",
		"execute",
		"limit",
		"offset",
		"orderBy",
	];

	for (const method of methods) {
		mockDb[method] = mock(() => mockDb);
	}
	// Transaction special handling
	mockDb.transaction = mock((cb: (tx: any) => any) => cb(mockDb));
};

export const mockLogger = {
	info: mock(),
	error: mock(),
	warn: mock(),
	debug: mock(),
};

export const mockWrite = mock(() => Promise.resolve());
export const mockPushToQueue = mock(() => Promise.resolve({ success: true }));

export const mockDeleteS3Object = mock(() => Promise.resolve());

// Setup global mocks
mock.module("@curiositi/db/client", () => ({
	default: mockDb,
}));

mock.module("@curiositi/share/logger", () => ({
	default: mockLogger,
}));

mock.module("@curiositi/share/fs/write", () => ({
	default: mockWrite,
	isS3UploadError: (error: unknown) =>
		error instanceof Error && (error as any).type === "S3UploadError",
	deleteS3Object: mockDeleteS3Object,
}));

mock.module("@curiositi/queue", () => ({
	pushToQueue: mockPushToQueue,
}));

// Mock Bun's hash function
mock.module("bun", () => ({
	hash: mock(() => "mock-hash-123"),
	// Forward other exports if necessary, or just rely on the fact that we only use hash
}));
