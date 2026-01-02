export default function read(path: string) {
	return Bun.file(path);
}
