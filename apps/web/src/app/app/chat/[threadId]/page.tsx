"use client";

import { use } from "react";

import Thread from "./thread";

import { useSpaces } from "@/hooks/use-spaces";
import { useConfigs } from "@/hooks/use-configs";
import { useUserFiles } from "@/hooks/use-files";
import { useThreadMessages } from "@/hooks/use-threads";
import GlobalError from "@/app/global-error";

export default function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = use(params);
  const { data: files, error: filesError } = useUserFiles();
  const { data: spaces, error: spacesError } = useSpaces();
  const { data: configs, error: configsError } = useConfigs();
  const { data: messages, error: messagesError } = useThreadMessages(threadId);

  if (filesError || spacesError || configsError || messagesError) {
    return (
      <GlobalError
        error={
          filesError || spacesError || configsError || messagesError
            ? new Error(
                `Error: ${filesError?.message} ${spacesError?.message} ${configsError?.message} ${messagesError?.message}`,
              )
            : new Error("Unknown error occurred")
        }
      />
    );
  }

  return (
    <Thread
      files={files?.data ?? null}
      spaces={spaces?.data?.map((space) => space.space) ?? null}
      configs={configs?.data ?? null}
      messages={messages?.data ?? null}
      threadId={threadId}
    />
  );
}
