import { ArrowUp } from "lucide-react";
import { Button } from "../ui/button";
import {
	PromptInput,
	PromptInputAction,
	PromptInputActions,
	PromptInputTextarea,
} from "../ui/prompt-input";
import ModelSelector from "./model-selector";
import { IconPaperclip } from "@tabler/icons-react";

type ChatInputProps = {
	isLoading: boolean;
	input: string;
	setInput: (value: string) => void;
	onSubmit: () => void;
};

export default function ChatInput({
	isLoading,
	input,
	setInput,
	onSubmit,
}: ChatInputProps) {
	return (
		<PromptInput
			isLoading={isLoading}
			value={input}
			onValueChange={setInput}
			onSubmit={onSubmit}
			className="border-input bg-background w-full rounded-2xl flex flex-col gap-1"
		>
			<PromptInputTextarea
				placeholder="Type a message..."
				className="dark:bg-background"
			/>
			<PromptInputActions className="flex w-full items-end justify-between gap-2 px-2 pb-1">
				<PromptInputAction tooltip="Attach files">
					<label htmlFor="file-upload">
						<input type="file" multiple className="hidden" id="file-upload" />
						<Button variant="ghost" size="icon-sm" className="rounded-full">
							<IconPaperclip />
						</Button>
					</label>
				</PromptInputAction>

				<div className="flex gap-3">
					<ModelSelector />

					<Button
						size="icon-sm"
						disabled={!input.trim() || isLoading}
						onClick={onSubmit}
						className="rounded-full"
					>
						{isLoading ? (
							<span className="size-3 rounded-xs bg-white" />
						) : (
							<ArrowUp className="h-4 w-4" />
						)}
					</Button>
				</div>
			</PromptInputActions>
		</PromptInput>
	);
}
