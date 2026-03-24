// src/start.ts
import { createStart, createMiddleware } from "@tanstack/react-start";

const requestLoggerMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		console.log(
			"\x1b[34m%s\x1b[0m",
			`[${request.method}]`,
			`:: ${request.url}`
		);
		return next();
	}
);

export const startInstance = createStart(() => {
	return {
		requestMiddleware: [requestLoggerMiddleware],
	};
});
