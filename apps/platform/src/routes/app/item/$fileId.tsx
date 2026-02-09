import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useQuery } from "@tanstack/react-query";
import { IconHome } from "@tabler/icons-react";
import FileIcon from "@platform/components/file-icon";
import FileContentPreview from "@platform/components/previews/file-content-preview";
import { Skeleton } from "@platform/components/ui/skeleton";
import NavigationButtons from "@platform/components/navigation-buttons";
import { useNavigationHistory } from "@platform/contexts/navigation-history-context";
import {
	IMAGE_TYPES,
	PDF_TYPE,
	TEXT_FILE_TYPES,
} from "@curiositi/share/constants";
import { toast } from "sonner";

export const Route = createFileRoute("/app/item/$fileId")({
	component: ItemPageComponent,
});

function ItemPageComponent() {
	const { fileId } = Route.useParams();

	const {
		data: fileData,
		error: fileQueryError,
		isLoading: isFileQueryLoading,
	} = useQuery({
		queryKey: ["file", fileId],
		queryFn: () => trpcClient.file.getById.query({ fileId }),
	});

	const { canGoBack, canGoForward, goBack, goForward, pushEntry } =
		useNavigationHistory();

	const file = fileData?.data;

	useEffect(() => {
		if (!fileId) {
			return;
		}

		pushEntry({
			path: `/app/item/${fileId}`,
			spaceId: null,
		});
	}, [fileId, pushEntry]);

	const presignedUrlQuery = useQuery({
		queryKey: ["file", "presignedUrl", fileId],
		queryFn: () => trpcClient.file.getPresignedUrl.query({ fileId }),
		enabled: !!file,
		staleTime: 1000 * 60 * 50,
	});

	if (!file) {
		return <>File Not Found</>;
	}

	if (fileQueryError || fileData.error) {
		toast.error("Error", {
			description: fileQueryError?.message || fileData.error,
		});
		return <>An unknown error occured</>;
	}

	const fileType: "image" | "pdf" | "text" = IMAGE_TYPES.includes(file.type)
		? "image"
		: PDF_TYPE === file.type
			? "pdf"
			: TEXT_FILE_TYPES.includes(file.type)
				? "text"
				: "text";

	if (isFileQueryLoading) {
		return (
			<div className="p-4">
				<Skeleton className="h-8 w-64 mb-4" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	if (!file) {
		return (
			<div className="p-4">
				<div className="text-center text-muted-foreground py-12">
					<p>File not found.</p>
					<Link
						to="/app"
						className="text-primary hover:underline mt-2 inline-block"
					>
						Go back home
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<NavigationButtons
						canGoBack={canGoBack}
						canGoForward={canGoForward}
						goBack={goBack}
						goForward={goForward}
					/>
					<nav className="flex items-center gap-1 text-sm">
						<Link
							to="/app"
							className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
						>
							<IconHome className="w-4 h-4" />
							Home
						</Link>
						<span className="text-muted-foreground">/</span>
						<span className="font-medium flex items-center gap-1">
							<FileIcon className="size-4" type={file.type} />
							{file.name}
						</span>
					</nav>
				</div>
			</div>
			<div className="bg-card rounded-xl p-6 border">
				<div className="flex items-center gap-4 mb-6">
					<div className="size-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
						{fileType === "image" && presignedUrlQuery.isLoading && (
							<Skeleton className="size-full" />
						)}
						{fileType === "image" && presignedUrlQuery.data?.url && (
							<img
								src={presignedUrlQuery.data.url}
								alt={file.name}
								className="size-full object-cover"
							/>
						)}
						{fileType !== "image" && (
							<FileIcon className="size-8" type={file.type} />
						)}
					</div>
					<div>
						<h1 className="text-xl font-semibold">{file.name}</h1>
						<p className="text-sm text-muted-foreground">
							{file.type} &middot; {(file.size / 1024).toFixed(1)} KB
						</p>
					</div>
				</div>
				<FileContentPreview
					file={file}
					fileType={fileType}
					presignedUrl={presignedUrlQuery.data?.url}
				/>

				<div className="grid grid-cols-2 gap-4 text-sm">
					<div>
						<p className="text-muted-foreground">Status</p>
						<p className="font-medium capitalize">{file.status}</p>
					</div>
					<div>
						<p className="text-muted-foreground">Created</p>
						<p className="font-medium">
							{new Date(file.createdAt).toLocaleDateString()}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
