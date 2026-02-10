import type { selectFileSchema } from "@curiositi/db/schema";
import { Button } from "@platform/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@platform/components/ui/dropdown-menu";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";

import {
	IconDotsVertical,
	IconDownload,
	IconExternalLink,
	IconRotateClockwise,
} from "@tabler/icons-react";
import { toast } from "sonner";
import type z from "zod";

export default function FileActions({
	presignedUrl,
	fileStatus,
	fileId,
}: {
	presignedUrl?: string;
	fileStatus: z.infer<typeof selectFileSchema.shape.status>;
	fileId: string;
}) {
	const handleDownload = async () => {
		if (!presignedUrl) return;
		try {
			const response = await fetch(presignedUrl);
			const blob = await response.blob();
			const filename =
				new URL(presignedUrl).pathname.split("/").pop() || "file";
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = decodeURIComponent(filename);
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Failed to download file", error);
		}
	};

	const handleOpenInNewTab = () => {
		window.open(presignedUrl, "_blank");
		console.log(`Opening file in new tab`, presignedUrl);
	};

	const handleReProcessFile = async () => {
		const data = await trpcClient.file.process.mutate({ fileId });
		if (data.data?.success) {
			toast.success("File has been enqueued for re-processing");
		}

		if (data.error) {
			toast.error("Failed to enqueue file for re-processing");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon-sm">
					<IconDotsVertical />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="bottom" align="end">
				<DropdownMenuGroup>
					{fileStatus === "pending" || fileStatus === "failed" ? (
						<>
							<DropdownMenuItem onClick={() => handleReProcessFile()}>
								<IconRotateClockwise />
								Re-Process File
							</DropdownMenuItem>
							<DropdownMenuSeparator />
						</>
					) : null}
					<DropdownMenuItem onClick={() => handleDownload()}>
						<IconDownload /> Download
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => handleOpenInNewTab()}>
						<IconExternalLink /> Open in new tab
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
