import type { selectSpaceSchema } from "@curiositi/db/schema";
import type z from "zod";
import FilePreview from "./previews/file-preview";
import SpacePreview from "./previews/space-preview";

type FileType = {
	id: string;
	name: string;
	path: string;
	size: number;
	type: string;
	organizationId: string;
	uploadedById: string;
	status: "pending" | "processing" | "completed" | "failed";
	tags: unknown;
	processedAt: Date | null;
	createdAt: Date;
	updatedAt: Date | null;
};

type ExplorerViewProps = {
	spaces?: z.infer<typeof selectSpaceSchema>[] | null;
	files?: FileType[] | null;
	isLoading?: boolean;
	emptyMessage?: string;
};

export default function ExplorerView({
	spaces,
	files,
	isLoading,
	emptyMessage = "No spaces or files yet.",
}: ExplorerViewProps) {
	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap gap-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={`space-skeleton-${i}`}
							className="w-32 h-28 rounded-xl bg-muted animate-pulse"
						/>
					))}
				</div>
				<div className="flex flex-wrap gap-4">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={`file-skeleton-${i}`}
							className="w-40 h-48 rounded-xl bg-muted animate-pulse"
						/>
					))}
				</div>
			</div>
		);
	}

	const hasSpaces = spaces && spaces.length > 0;
	const hasFiles = files && files.length > 0;

	if (!hasSpaces && !hasFiles) {
		return (
			<div className="text-center text-muted-foreground py-12">
				<p>{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{hasSpaces && (
				<div className="flex flex-wrap gap-4">
					{spaces.map((space) => (
						<SpacePreview key={space.id} space={space} />
					))}
				</div>
			)}
			{hasFiles && (
				<div className="flex flex-wrap gap-4">
					{files.map((file) => (
						<FilePreview key={file.id} file={file} />
					))}
				</div>
			)}
		</div>
	);
}
