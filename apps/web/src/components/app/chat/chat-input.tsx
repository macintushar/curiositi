"use client";

import type { AllFiles, Configs, Space } from "@/types";
import MessageInput from "./message-input";
import useChatStore from "@/stores/useChatStore";
import { useEffect } from "react";
import { useCreateThread } from "@/hooks/use-threads";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ChatInput({
  files,
  spaces,
  configs,
  isLoading,
}: {
  files: AllFiles[] | null;
  spaces: Space[] | null;
  configs: Configs | null;
  isLoading?: boolean;
}) {
  const { setFiles, setSpaces, setConfigs } = useChatStore();
  const router = useRouter();
  const createThreadMutation = useCreateThread();

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
      onSubmit={() => {
        createThreadMutation.mutate(undefined, {
          onSuccess: (data) => {
            if (data?.data) {
              router.push(`/app/chat/${data.data.id}`);
            }
          },
          onError: (error) => {
            toast.error(error.message || "Failed to create thread");
          },
        });
      }}
      isLoading={isLoading ?? createThreadMutation.isPending}
    />
  );
}
