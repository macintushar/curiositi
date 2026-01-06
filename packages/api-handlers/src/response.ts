export function createResponse<T, E>(data: T | null, error: E | null) {
	return {
		data,
		error,
	};
}
