"use client";

import { useEffect } from "react";

import {
  ChatContainerRoot,
  ChatContainerContent,
} from "@/components/ui/chat-container";
import MessageInput from "@/components/app/chat/message-input";
import MessageContainer from "@/components/app/chat/message-container";

import useChatStore from "@/stores/useChatStore";

import type { AllFiles, Configs, Space, ThreadMessage } from "@/types";
import { search } from "@/actions/search";
import useThreadStore from "@/stores/useThreadStore";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { ScrollButton } from "@/components/ui/scroll-button";

export default function Thread({
  files,
  spaces,
  configs,
  messages,
  threadId,
}: {
  files: AllFiles[] | null;
  spaces: Space[] | null;
  configs: Configs | null;
  messages: ThreadMessage[] | null;
  threadId: string;
}) {
  const {
    setFiles,
    setSpaces,
    setConfigs,
    setIsLoading,
    setPrompt,
    isLoading,
    prompt,
    activeModel,
    context,
  } = useChatStore();

  const { messages: messagesState, setMessages: setMessagesState } =
    useThreadStore();

  useEffect(() => {
    if (files) {
      setFiles(files);
    }
    if (spaces) {
      setSpaces(spaces);
    }
    if (configs) {
      setConfigs(configs);
    }
    if (messages) {
      setMessagesState(messages);
    }
  }, [
    files,
    setFiles,
    spaces,
    setSpaces,
    configs,
    setConfigs,
    messages,
    setMessagesState,
  ]);

  return (
    <div className="flex h-full flex-col items-center justify-between gap-2 px-2 py-2">
      <ChatContainerRoot className="h-full w-full max-w-4xl flex-1 overflow-y-auto">
        <ChatContainerContent className="space-y-5">
          {messagesState.map((message, idx) => (
            <MessageContainer
              key={idx}
              message={message}
              isLastMessage={idx === messagesState.length - 1}
            />
          ))}
          {isLoading && (
            <div className="flex h-64 w-full">
              <Loader
                variant="text-shimmer"
                text="Curiositi is thinking..."
                size="lg"
                className="font-serif text-xl italic"
              />
            </div>
          )}
        </ChatContainerContent>
        <div className="absolute right-12 bottom-50">
          <ScrollButton />
        </div>
      </ChatContainerRoot>
      <MessageInput
        onSubmit={async () => {
          if (!activeModel || !prompt.trim() || !threadId) {
            console.error("Missing required fields:", {
              activeModel,
              prompt: prompt.trim(),
              threadId,
            });
            return;
          }

          setMessagesState([
            ...messagesState,
            {
              role: "user",
              content: prompt.trim(),
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              threadId,
              documentSearches: [],
              webSearches: [],
              documentSearchResults: [],
              webSearchResults: [],
              confidence: 0,
              followUpSuggestions: [],
              strategy: "comprehensive",
              specificFileContent: [],
              model: activeModel.model.model,
              provider: activeModel.provider_name,
              reasoning: null,
            },
          ]);

          setIsLoading(true);
          const data = await search({
            input: prompt.trim(),
            model: activeModel.model.model,
            provider: activeModel.provider_name,
            thread_id: threadId,
            space_ids: context
              .filter((item) => item.type === "space")
              .map((item) => item.id),
            file_ids: context
              .filter((item) => item.type === "file")
              .map((item) => item.id),
          });

          console.log("data", data);

          if (data.error) {
            toast.error(data.error);
          }

          if (data.data?.error) {
            toast.error(data.data.error);
          }

          if (data?.data?.data) {
            setMessagesState([...messagesState, data.data.data]);
          }
          setIsLoading(false);
          setPrompt("");
        }}
      />
    </div>
  );
}
