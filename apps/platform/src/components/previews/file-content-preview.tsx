import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@platform/components/ui/skeleton";
import { Markdown } from "@platform/components/ui/markdown";

type FileType = "image" | "pdf" | "text";

type FileContentPreviewProps = {
	file: {
		id: string;
		name: string;
		type: string;
		size: number;
		status: string;
		createdAt: Date;
		path: string;
		organizationId: string;
		uploadedById: string;
		tags: unknown;
		processedAt: Date | null;
		updatedAt: Date | null;
	};
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
			<div className="mb-6">
				{!presignedUrl ? (
					<div className="max-w-full max-h-96 rounded-lg overflow-hidden">
						<Skeleton className="h-64 w-full" />
					</div>
				) : (
					<img
						src={presignedUrl}
						alt={file.name}
						className="max-w-full max-h-96 rounded-lg object-contain mx-auto"
					/>
				)}
			</div>
		);
	}

	if (fileType === "pdf") {
		if (!presignedUrl) {
			return (
				<div className="mt-6 text-sm text-muted-foreground">
					Loading preview...
				</div>
			);
		}

		return (
			<div className="mt-6 space-y-2">
				<div className="border rounded-lg overflow-hidden h-96">
					<iframe
						src={presignedUrl}
						title={file.name}
						className="w-full h-full"
					/>
				</div>
				<div className="text-xs text-muted-foreground">
					If the preview does not load, you can{" "}
					<a
						href={presignedUrl}
						target="_blank"
						rel="noreferrer"
						className="text-primary underline"
					>
						open the PDF in a new tab
					</a>
					.
				</div>
			</div>
		);
	}

	if (fileType === "text") {
		return <TextFilePreview file={file} presignedUrl={presignedUrl} />;
	}

	return (
		<div className="mt-6 text-sm text-muted-foreground">
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
			<div className="mt-6 text-sm text-muted-foreground">
				Loading preview...
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="mt-6 space-y-2">
				<Skeleton className="h-6 w-48" />
				<Skeleton className="h-40 w-full" />
			</div>
		);
	}

	if (isError || !content) {
		return (
			<div className="mt-6 text-sm text-muted-foreground">
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
		<div className="mt-6">
			<div className="border rounded-lg bg-muted/40 p-4 max-h-96 overflow-auto">
				{isMarkdown ? (
					<div className="max-w-none">
						<Markdown className="prose prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs dark:prose-invert">
							{content}
						</Markdown>
					</div>
				) : (
					// <pre className="text-sm font-mono whitespace-pre-wrap break-normal">
					// 	{content}
					// </pre>
					<></>
				)}
			</div>
		</div>
	);
}
