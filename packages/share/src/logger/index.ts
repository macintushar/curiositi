const logger = {
	info: (msg: string, obj?: unknown) => console.info(`[INFO] ${msg}`, obj),
	error: (msg: unknown, obj?: unknown) => console.error(`[ERROR] ${msg}`, obj),
	debug: (msg: string, obj?: unknown) => console.debug(`[DEBUG] ${msg}`, obj),
};

export default logger;
