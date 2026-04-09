import { Badge } from "../ui/badge";
import FileIcon from "../file-icon";

import { IconPaperclip, IconX } from "@tabler/icons-react";
import { type CtxFile, useChatStore } from "@platform/stores/chat-store";
import { Button } from "../ui/button";
import {
	Popover,
	PopoverContent,
	PopoverHeader,
	PopoverTrigger,
} from "../ui/popover";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { useQuery } from "@tanstack/react-query";
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";

export function ContextList() {
	const { files, removeFile } = useChatStore();
	return (
		<div className="flex flex-wrap gap-1">
			{files.map((f, i) => (
				<Badge key={i} className="flex items-center" variant="secondary">
					<FileIcon type={f.type} />
					{f.name}
					<Button onClick={() => removeFile(f.id)} className="w-fit h-fit p-0">
						<IconX className="size-3 bg-red-300" />
					</Button>
				</Badge>
			))}
		</div>
	);
}

export function ContextSelector() {
	const { data: orgFiles } = useQuery({
		queryKey: ["files"],
		queryFn: async () =>
			await trpcClient.file.getAllInOrg.query({ limit: 1000, offset: 0 }),
	});

	const { files, addFile, removeFile } = useChatStore();

	function handleFileClick(file: CtxFile) {
		const f = files.find((f) => f.id === file.id);
		if (f) {
			removeFile(file.id);
		} else {
			addFile(file);
		}
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon-sm" className="rounded-full">
					<IconPaperclip />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="h-full max-w-72 w-full">
				<PopoverHeader>
					<Input
						placeholder="Search for files in your workspace..."
						onClick={(e) => e.stopPropagation()}
					/>
				</PopoverHeader>
				<Separator className="my-2" />
				<div className="h-48 overflow-y-auto flex flex-col gap-1">
					{orgFiles?.data?.data.map((f) => {
						const isFileInContext = files.find((file) => file.id === f.id);
						return (
							<Button
								size="sm"
								key={f.id}
								variant={isFileInContext ? "activeGhost" : "ghost"}
								className="w-full justify-start items-center"
								onClick={(e) => {
									e.stopPropagation();
									handleFileClick({ id: f.id, name: f.name, type: f.type });
								}}
							>
								<FileIcon type={f.type} />
								<p className="truncate">{f.name}</p>
								{isFileInContext && <IconX className="ml-auto" />}
							</Button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
