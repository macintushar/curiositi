import { Switch } from "@platform/components/ui/switch";
import { useChatStore } from "@platform/stores/chat-store";
import { cn } from "@platform/lib/utils";
import { Globe, FileSearch } from "lucide-react";

export default function ToolToggles() {
	const {
		webSearchEnabled,
		fileSearchEnabled,
		setWebSearchEnabled,
		setFileSearchEnabled,
	} = useChatStore();

	return (
		<div className="flex items-center gap-4">
			<button
				type="button"
				onClick={() => setWebSearchEnabled(!webSearchEnabled)}
				className={cn(
					"flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
					webSearchEnabled
						? "bg-primary/10 border-primary/30 text-primary"
						: "bg-muted/30 border-border text-muted-foreground"
				)}
			>
				<Globe className="w-3.5 h-3.5" />
				Web
				<Switch
					checked={webSearchEnabled}
					onCheckedChange={setWebSearchEnabled}
					className="scale-75"
					onClick={(e) => e.stopPropagation()}
				/>
			</button>

			<button
				type="button"
				onClick={() => setFileSearchEnabled(!fileSearchEnabled)}
				className={cn(
					"flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
					fileSearchEnabled
						? "bg-primary/10 border-primary/30 text-primary"
						: "bg-muted/30 border-border text-muted-foreground"
				)}
			>
				<FileSearch className="w-3.5 h-3.5" />
				Files
				<Switch
					checked={fileSearchEnabled}
					onCheckedChange={setFileSearchEnabled}
					className="scale-75"
					onClick={(e) => e.stopPropagation()}
				/>
			</button>
		</div>
	);
}
