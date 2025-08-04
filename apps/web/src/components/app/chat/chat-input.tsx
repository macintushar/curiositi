"use client";

import type { AllFiles, Configs, Space } from "@/types";
import MessageInput from "./message-input";
import useChatStore from "@/stores/useChatStore";
import { useEffect } from "react";
import { createThread } from "@/actions/thread";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { tryCatch } from "@/lib/utils";

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
  const router = useRouter();

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
    <MessageInput
      onSubmit={async () => {
        const res = await tryCatch(createThread());

        console.log(res);

        if (res.error) {
          toast.error(res.error.message);
        }
        if (res.data?.error) {
          toast.error(res.data.error);
          return;
        }
        if (res.data?.data) {
          router.push(`/app/chat/${res.data.data.id}`);
        }
      }}
    />
  );
}
