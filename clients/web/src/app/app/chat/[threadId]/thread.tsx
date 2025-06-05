"use client";

import { useEffect, useState } from "react";

import {
  ChatContainerRoot,
  ChatContainerContent,
} from "@/components/ui/chat-container";
import MessageInput from "@/components/app/chat/message-input";
import MessageContainer from "@/components/app/chat/message-container";

import useChatStore from "@/stores/useChatStore";

import type { AllFiles, ProviderResponse, Space, ThreadMessage } from "@/types";

export default function Thread({
  files,
  spaces,
  configs,
  messages,
}: {
  files: AllFiles[] | null;
  spaces: Space[] | null;
  configs: ProviderResponse | null;
  messages: ThreadMessage[] | null;
}) {
  const { setFiles, setSpaces, setConfigs } = useChatStore();

  const [messagesState] = useState<ThreadMessage[]>(messages ?? []);

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

  return (
    <div className="flex h-full flex-col items-center justify-between gap-2 px-2 py-2 sm:px-0">
      <ChatContainerRoot className="h-full w-full flex-1 overflow-y-auto sm:w-2/3">
        <ChatContainerContent className="space-y-5">
          {messagesState.map((message, idx) => (
            <MessageContainer key={idx} message={message} />
          ))}
        </ChatContainerContent>
      </ChatContainerRoot>
      <MessageInput />
    </div>
  );
}
