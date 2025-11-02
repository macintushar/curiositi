"use client";

import { useEffect, useRef } from "react";

import {
  ChatContainerRoot,
  ChatContainerContent,
  ChatContainerScrollAnchor,
} from "@/components/ui/chat-container";
import MessageInput from "@/components/app/chat/message-input";
import MessageContainer from "@/components/app/chat/message-container";

import useChatStore from "@/stores/useChatStore";

import type { AllFiles, Configs, Space, ThreadMessage } from "@/types";
import useThreadStore from "@/stores/useThreadStore";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { ScrollButton } from "@/components/ui/scroll-button";
import { sendMessageStream } from "@/services/chats";
import { clientApiFetch } from "@/services/client-fetch";
import type { ApiResponse } from "@/types";

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
    isStreaming,
    setIsStreaming,
  } = useChatStore();

  const { messages: messagesState, setMessages: setMessagesState } =
    useThreadStore();

  const abortControllerRef = useRef<AbortController | null>(null);

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
  }, [files, setFiles, spaces, setSpaces, configs, setConfigs]);

  useEffect(() => {
    if (messages) {
      setMessagesState(messages);
    } else {
      setMessagesState([]);
    }
  }, [threadId, messages, setMessagesState]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

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
        <ChatContainerScrollAnchor />
        <div className="absolute right-12 bottom-50">
          <ScrollButton />
        </div>
      </ChatContainerRoot>
      <MessageInput
        isLoading={isStreaming}
        onStop={() => abortControllerRef.current?.abort()}
        onSubmit={async () => {
          if (isStreaming) {
            return;
          }

          if (!activeModel || !prompt.trim() || !threadId) {
            console.error("Missing required fields:", {
              activeModel,
              prompt: prompt.trim(),
              threadId,
            });
            return;
          }

          const question = prompt.trim();
          setPrompt("");

          // Append user message optimistically
          const userMessage: ThreadMessage = {
            role: "user",
            content: question,
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
          };

          const assistantId = crypto.randomUUID();
          const assistantSkeleton: ThreadMessage = {
            role: "assistant",
            content: "",
            id: assistantId,
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
          };

          setMessagesState([
            ...useThreadStore.getState().messages,
            userMessage,
            assistantSkeleton,
          ]);

          setIsLoading(true);
          setIsStreaming(true);

          const abortController = new AbortController();
          abortControllerRef.current = abortController;

          try {
            const stream = await sendMessageStream(
              question,
              activeModel.model.model,
              activeModel.provider_name,
              threadId,
              context
                .filter((item) => item.type === "space")
                .map((item) => item.id),
              context
                .filter((item) => item.type === "file")
                .map((item) => item.id),
              abortController.signal,
            );

            let accumulated = "";
            for await (const chunk of stream) {
              accumulated += chunk;
              const current = useThreadStore.getState().messages;
              const updated = current.map((m) =>
                m.id === assistantId ? { ...m, content: accumulated } : m,
              );
              setMessagesState(updated);
            }

            // After completion, try to refresh to get metadata saved by server
            try {
              const refreshed = await clientApiFetch<ApiResponse<ThreadMessage[]>>(
                `/api/v1/threads/${threadId}/messages`,
                { method: "GET" },
              );
              if (refreshed?.data) {
                setMessagesState(refreshed.data);
              }
            } catch {
              // ignore refresh errors, we already showed streamed content
            }
          } catch (err: unknown) {
            // Ignore user-initiated aborts
            if (
              err &&
              typeof err === "object" &&
              "name" in err &&
              (err as any).name === "AbortError"
            ) {
              return;
            }

            console.error("Streaming error:", err);
            toast.error(
              err instanceof Error ? err.message : "Failed to stream response",
            );
          } finally {
            setIsLoading(false);
            setIsStreaming(false);
            abortControllerRef.current = null;
          }
        }}
      />
    </div>
  );
}
