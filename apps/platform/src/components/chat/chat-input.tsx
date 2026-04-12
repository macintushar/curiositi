import { ArrowUp } from "lucide-react";
import { Button } from "../ui/button";
import {
	PromptInput,
	PromptInputActions,
	PromptInputTextarea,
} from "../ui/prompt-input";
import ModelSelector from "./model-selector";
import AgentSelector from "./agent-selector";
import { ContextList, ContextSelector } from "./context";
import ToolToggles from "./tool-toggles";

type ChatInputProps = {
	isLoading: boolean;
	input: string;
	setInput: (value: string) => void;
	onSubmit: () => void;
	onOpenSettings?: () => void;
};

export default function ChatInput({
	isLoading,
	input,
	setInput,
	onSubmit,
	onOpenSettings,
}: ChatInputProps) {
	return (
		<PromptInput
			isLoading={isLoading}
			value={input}
			onValueChange={setInput}
			onSubmit={onSubmit}
			className="border-input bg-background w-full max-w-lg rounded-2xl flex flex-col gap-1"
		>
			<ContextList />
			<PromptInputTextarea
				placeholder="Type a message..."
				className="dark:bg-background"
			/>
			<PromptInputActions className="flex w-full items-end justify-between gap-2 px-2 pb-1">
				<div className="flex items-center gap-2">
					<ContextSelector />
					<ToolToggles />
				</div>

				<div className="flex gap-3">
					<AgentSelector onOpenSettings={onOpenSettings} />
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
