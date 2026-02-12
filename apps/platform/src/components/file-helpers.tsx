"use client";

import { Badge } from "@platform/components/ui/badge";
import * as React from "react";

export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = React.useState(value);
	React.useEffect(() => {
		const handler = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(handler);
	}, [value, delay]);
	return debouncedValue;
}

export function FileTags({ tags }: { tags: unknown }) {
	const tagArray = (tags as { tags?: string[] })?.tags;
	if (!Array.isArray(tagArray) || tagArray.length === 0) return null;
	return (
		<div className="flex items-center gap-1 mt-1">
			{tagArray.map((tag) => (
				<Badge key={tag} variant="secondary" className="text-[10px] px-1 py-0">
					{tag}
				</Badge>
			))}
		</div>
	);
}
