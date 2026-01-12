import baseLogger from "@curiositi/share/logger";

export type Logger = typeof baseLogger;

export function createLogger(requestId: string): Logger {
	return {
		info: (msg: string, obj?: unknown) =>
			baseLogger.info(msg, { ...(obj as object), requestId }),
		error: (msg: unknown, obj?: unknown) =>
			baseLogger.error(msg, { ...(obj as object), requestId }),
		debug: (msg: string, obj?: unknown) =>
			baseLogger.debug(msg, { ...(obj as object), requestId }),
	};
}
