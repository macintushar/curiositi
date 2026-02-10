import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@platform/components/ui/skeleton";
import { Markdown } from "@platform/components/ui/markdown";
import { cn } from "@platform/lib/utils";
import type z from "zod";
import type { selectFileSchema } from "@curiositi/db/schema";

function FilePreviewCard({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col h-full min-h-0 overflow-auto rounded-lg",
				className
			)}
		>
			{children}
		</div>
	);
}

type FileType = "image" | "pdf" | "text";

type FileContentPreviewProps = {
	file: z.infer<typeof selectFileSchema>;
	fileType: FileType;
	presignedUrl?: string;
};

export default function FileContentPreview({
	file,
	fileType,
	presignedUrl,
}: FileContentPreviewProps) {
	if (fileType === "image") {
		return (
			<div className="h-full min-h-0">
				{!presignedUrl ? (
					<div className="max-w-full rounded-lg overflow-hidden">
						<Skeleton className="h-64 w-full" />
					</div>
				) : (
					<FilePreviewCard className="object-fill flex items-center justify-center">
						<img
							src={presignedUrl}
							alt={file.name}
							className="max-w-full rounded-lg object-contain mx-auto"
						/>
					</FilePreviewCard>
				)}
			</div>
		);
	}

	if (fileType === "pdf") {
		if (!presignedUrl) {
			return (
				<div className="text-sm text-muted-foreground">Loading preview...</div>
			);
		}

		return (
			<FilePreviewCard>
				<iframe
					src={presignedUrl}
					title={file.name}
					className="w-full h-full min-h-0 flex-1"
				/>
			</FilePreviewCard>
		);
	}

	if (fileType === "text") {
		return <TextFilePreview file={file} presignedUrl={presignedUrl} />;
	}

	return (
		<div className="text-sm text-muted-foreground">
			No preview available for this file type.
			{presignedUrl ? (
				<>
					{" "}
					You can{" "}
					<a
						href={presignedUrl}
						target="_blank"
						rel="noreferrer"
						className="text-primary underline"
					>
						open the file in a new tab
					</a>
					.
				</>
			) : null}
		</div>
	);
}

type TextFilePreviewProps = {
	file: FileContentPreviewProps["file"];
	presignedUrl?: string;
};

function TextFilePreview({ file, presignedUrl }: TextFilePreviewProps) {
	const [hasMounted, setHasMounted] = useState(false);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	const {
		data: content,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["file", "content", file.id],
		queryFn: async () => {
			if (!presignedUrl) {
				throw new Error("Missing URL for file content");
			}

			const response = await fetch(presignedUrl);

			if (!response.ok) {
				throw new Error("Failed to fetch file content");
			}

			return response.text();
		},
		enabled: hasMounted && !!presignedUrl,
	});

	if (!presignedUrl) {
		return (
			<div className="text-sm text-muted-foreground">Loading preview...</div>
		);
	}

	if (isLoading) {
		return (
			<div className="space-y-2">
				<Skeleton className="h-40 w-full" />
			</div>
		);
	}

	if (isError || !content) {
		return (
			<div className="text-sm text-muted-foreground">
				Could not load file contents.{" "}
				<a
					href={presignedUrl}
					target="_blank"
					rel="noreferrer"
					className="text-primary underline"
				>
					Open file in a new tab
				</a>
				.
			</div>
		);
	}

	const isMarkdown = file.type.includes("markdown");

	return (
		<FilePreviewCard>
			{isMarkdown ? (
				<Markdown className="min-w-full px-2 prose prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs dark:prose-invert">
					{content}
				</Markdown>
			) : (
				<pre className="text-sm font-mono whitespace-pre-wrap break-normal p-4">
					{content}
				</pre>
			)}
		</FilePreviewCard>
	);
}
