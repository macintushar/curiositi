import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function createResponse<T, E>(data: T | null, error: E | null) {
	return {
		data,
		error,
	};
}

export function getTime(time: number) {
	return new Date(time)
		.toLocaleTimeString("en-US", {
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})
		.split(/\s+/);
}
