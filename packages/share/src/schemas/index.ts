import z from "zod";

export const uploadSchema = z.object({
	file: z.instanceof(File),
});
