import { use } from "react";

import Thread from "./thread";

import { getSpaces } from "@/services/spaces";
import { getConfigs } from "@/services/configs";
import { getUsersFiles } from "@/services/files";
import { getThreadMessages } from "@/services/chats";
import GlobalError from "@/app/global-error";

export default function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = use(params);
  const { data: files, error: filesError } = use(getUsersFiles());
  const { data: spaces, error: spacesError } = use(getSpaces());
  const { data: configs, error: configsError } = use(getConfigs());
  const { data: messages, error: messagesError } = use(
    getThreadMessages(threadId),
  );

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
