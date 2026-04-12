declare module "pptx2json" {
	class PPTX2Json {
		constructor(options?: Record<string, unknown>);
		toJson(file: string): Promise<Record<string, unknown>>;
		buffer2json(buffer: Buffer): Promise<Record<string, unknown>>;
	}
	export default PPTX2Json;
}
