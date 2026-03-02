import { describe, expect, it, vi } from "vitest";
import {
	cn,
	createResponse,
	getTime,
	handleFormSubmit,
	stopPropagation,
} from "@platform/lib/utils";

describe("Utils", () => {
	describe("cn", () => {
		it("should merge class names", () => {
			expect(cn("foo", "bar")).toBe("foo bar");
		});

		it("should handle conditional classes", () => {
			expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
		});

		it("should merge tailwind classes correctly", () => {
			expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
		});

		it("should handle undefined values", () => {
			expect(cn("foo", undefined, "bar")).toBe("foo bar");
		});

		it("should handle empty strings", () => {
			expect(cn("", "foo", "")).toBe("foo");
		});

		it("should handle arrays of classes", () => {
			expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
		});

		it("should handle objects", () => {
			expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
		});
	});

	describe("createResponse", () => {
		it("should create response with data", () => {
			const result = createResponse({ id: 1 }, null);
			expect(result.data).toEqual({ id: 1 });
			expect(result.error).toBeNull();
		});

		it("should create response with error", () => {
			const error = new Error("Test error");
			const result = createResponse(null, error);
			expect(result.data).toBeNull();
			expect(result.error).toBe(error);
		});

		it("should handle null for both", () => {
			const result = createResponse(null, null);
			expect(result.data).toBeNull();
			expect(result.error).toBeNull();
		});

		it("should handle string data", () => {
			const result = createResponse("success", null);
			expect(result.data).toBe("success");
		});

		it("should handle array data", () => {
			const data = [1, 2, 3];
			const result = createResponse(data, null);
			expect(result.data).toEqual(data);
		});
	});

	describe("getTime", () => {
		it("should return time array with hour and period", () => {
			const result = getTime(1700000000000);
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(2);
		});

		it("should return properly formatted time string", () => {
			const result = getTime(1700000000000);
			expect(result[0]).toMatch(/^\d{1,2}:\d{2}$/);
			expect(result[1]).toMatch(/^(AM|PM)$/);
		});

		it("should return AM for early morning hours", () => {
			const earlyMorning = new Date();
			earlyMorning.setHours(6, 0, 0, 0);
			const result = getTime(earlyMorning.getTime());

			expect(result[1]).toBe("AM");
		});

		it("should return PM for afternoon hours", () => {
			const afternoon = new Date();
			afternoon.setHours(14, 0, 0, 0);
			const result = getTime(afternoon.getTime());

			expect(result[1]).toBe("PM");
		});
	});

	describe("handleFormSubmit", () => {
		it("should prevent default and call handler", async () => {
			const handleSubmit = vi.fn();
			const event = {
				preventDefault: vi.fn(),
				stopPropagation: vi.fn(),
			} as unknown as React.FormEvent;

			await handleFormSubmit(handleSubmit)(event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(event.stopPropagation).toHaveBeenCalled();
			expect(handleSubmit).toHaveBeenCalled();
		});

		it("should handle async handler", async () => {
			const handleSubmit = vi.fn().mockResolvedValue(undefined);
			const event = {
				preventDefault: vi.fn(),
				stopPropagation: vi.fn(),
			} as unknown as React.FormEvent;

			await handleFormSubmit(handleSubmit)(event);

			expect(handleSubmit).toHaveBeenCalled();
		});
	});

	describe("stopPropagation", () => {
		it("should prevent default and stop propagation", () => {
			const fn = vi.fn();
			const event = {
				preventDefault: vi.fn(),
				stopPropagation: vi.fn(),
			} as unknown as React.MouseEvent;

			stopPropagation(fn)(event);

			expect(event.preventDefault).toHaveBeenCalled();
			expect(event.stopPropagation).toHaveBeenCalled();
			expect(fn).toHaveBeenCalled();
		});
	});
});
