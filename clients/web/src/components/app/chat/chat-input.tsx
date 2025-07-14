"use client";

import type { AllFiles, Configs, Space } from "@/types";
import MessageInput from "./message-input";
import useChatStore from "@/stores/useChatStore";
import { useEffect } from "react";

export default function ChatInput({
  files,
  spaces,
  configs,
}: {
  files: AllFiles[] | null;
  spaces: Space[] | null;
  configs: Configs | null;
}) {
  const { setFiles, setSpaces, setConfigs } = useChatStore();

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

  return <MessageInput />;
}
