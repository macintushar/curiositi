import type { SelectFile } from "./db-schemas";

export type FileTags = { tags?: string[] };

export type SearchResult = {
	file: SelectFile;
	score: number;
	matchType: "name" | "content" | "tag" | "space";
	spaceName?: string | null;
	spaceId?: string | null;
};
