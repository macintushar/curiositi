const logger = {
	info: (msg: string, obj?: unknown) =>
		console.info(`[INFO] ${msg}`, { metadata: obj }),
	warn: (msg: string, obj?: unknown) =>
		console.warn(`[WARN] ${msg}`, { metadata: obj }),
	error: (msg: unknown, obj?: unknown) =>
		console.error(`[ERROR] ${msg}`, { metadata: obj }),
	debug: (msg: string, obj?: unknown) =>
		console.debug(`[DEBUG] ${msg}`, { metadata: obj }),
};

export default logger;
