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
	border = true,
}: {
	children: React.ReactNode;
	border?: boolean;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"flex flex-col h-full min-h-0 overflow-auto rounded-lg",
				border ? "border" : "",
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
	isMobile: boolean;
	presignedUrl?: string;
};

export default function FileContentPreview({
	file,
	fileType,
	isMobile = false,
	presignedUrl,
}: FileContentPreviewProps) {
	if (!presignedUrl) {
		return (
			<div className="text-sm text-muted-foreground">Loading preview...</div>
		);
	}

	if (fileType === "image") {
		return (
			<FilePreviewCard
				className="object-contain flex items-center justify-center"
				border={!isMobile}
			>
				<img src={presignedUrl} alt={file.name} />
			</FilePreviewCard>
		);
	}

	if (fileType === "pdf") {
		return (
			<FilePreviewCard className="h-full">
				<iframe
					src={presignedUrl}
					title={file.name}
					className="w-full h-full min-h-0 flex-1"
				/>
			</FilePreviewCard>
		);
	}

	if (fileType === "text") {
		return (
			<TextFilePreview
				file={file}
				presignedUrl={presignedUrl}
				isMobile={isMobile}
			/>
		);
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
	isMobile?: boolean;
};

function TextFilePreview({
	file,
	presignedUrl,
	isMobile = false,
}: TextFilePreviewProps) {
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
		<FilePreviewCard className="sm:items-center" border={!isMobile}>
			{isMarkdown ? (
				<Markdown className=" px-2 prose prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs dark:prose-invert">
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
