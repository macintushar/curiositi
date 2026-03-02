import { describe, expect, test } from "bun:test";
import { createResponse } from "../src/response";

describe("Response Utility", () => {
	test("should create response with data", () => {
		const data = { id: "123", name: "test" };
		const result = createResponse(data, null);

		expect(result.data).toEqual(data);
		expect(result.error).toBeNull();
	});

	test("should create response with error", () => {
		const error = new Error("Something went wrong");
		const result = createResponse(null, error);

		expect(result.data).toBeNull();
		expect(result.error).toEqual(error);
	});

	test("should create response with null for both", () => {
		const result = createResponse(null, null);

		expect(result.data).toBeNull();
		expect(result.error).toBeNull();
	});

	test("should handle string data", () => {
		const result = createResponse("success", null);

		expect(result.data).toBe("success");
		expect(result.error).toBeNull();
	});

	test("should handle array data", () => {
		const data = [{ id: 1 }, { id: 2 }];
		const result = createResponse(data, null);

		expect(result.data).toEqual(data);
		expect(result.error).toBeNull();
	});

	test("should handle string error", () => {
		const result = createResponse(null, "Error message");

		expect(result.data).toBeNull();
		expect(result.error).toBe("Error message");
	});

	test("should handle object error", () => {
		const errorObj = { code: "ERR001", message: "Failed" };
		const result = createResponse(null, errorObj);

		expect(result.data).toBeNull();
		expect(result.error).toEqual(errorObj);
	});
});
