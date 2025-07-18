"use client";

import {
  IconArrowUp,
  IconFileText,
  IconFolder,
  IconX,
} from "@tabler/icons-react";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputActions,
} from "@/components/ui/prompt-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import ContextSelector from "./context-selector";
import ModelSelector from "./model-selector";

import useChatStore from "@/stores/useChatStore";

type MessageInputProps = {
  onSubmit?: () => void;
};

export default function MessageInput({ onSubmit }: MessageInputProps) {
  const { prompt, isLoading, context, setContext, setPrompt } = useChatStore();

  return (
    <div className="bg-primary-foreground mx-auto flex h-fit w-full max-w-3xl flex-col gap-2 rounded-3xl p-1 pt-2">
      <div className="flex h-fit w-full flex-wrap items-center gap-1 px-3">
        <ContextSelector />
        <div className="bg-border mx-1 h-4 w-px" />
        {context.length > 0 &&
          context.map((item, idx) => (
            <Badge
              variant="outline"
              className="group flex cursor-pointer items-center select-none"
              onClick={() => {
                setContext(context.filter((_, i) => i !== idx));
              }}
              key={idx}
            >
              {item.type === "file" ? (
                <IconFileText className="block group-hover:hidden" />
              ) : (
                <IconFolder className="block group-hover:hidden" />
              )}
              <IconX className="hidden group-hover:block" />
              {item.name}
            </Badge>
          ))}
      </div>
      <PromptInput
        isLoading={false}
        value={prompt}
        onValueChange={setPrompt}
        onSubmit={onSubmit}
        className="border-input relative z-10 w-full rounded-3xl border p-0 pt-1 shadow-xs"
      >
        <div className="flex flex-col">
          <PromptInputTextarea
            placeholder="Ask anything..."
            className="min-h-[44px] pt-3 pl-4 text-base leading-[1.3]"
          />

          <PromptInputActions className="mt-5 flex w-full items-center justify-between gap-2 px-3 pb-3">
            <div className="flex w-full items-center justify-between gap-2">
              <ModelSelector />
              <Button
                size="icon"
                disabled={!prompt.trim() || isLoading}
                onClick={onSubmit}
              >
                {!isLoading ? (
                  <IconArrowUp />
                ) : (
                  <span className="size-3 rounded-xs bg-white" />
                )}
              </Button>
            </div>
          </PromptInputActions>
        </div>
      </PromptInput>
    </div>
  );
}
