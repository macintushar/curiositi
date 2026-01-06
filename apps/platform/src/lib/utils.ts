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
