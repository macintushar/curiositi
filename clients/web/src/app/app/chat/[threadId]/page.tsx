import { use } from "react";

import Thread from "./thread";

import { getSpaces } from "@/services/spaces";
import { getConfigs } from "@/services/configs";
import { getUsersFiles } from "@/services/files";
import { getThreadMessages } from "@/services/chats";

export default function ThreadPage({
  params,
}: {
  params: { threadId: string };
}) {
  console.log(params);
  const { data: files, error: filesError } = use(getUsersFiles());
  const { data: spaces, error: spacesError } = use(getSpaces());
  const { data: configs, error: configsError } = use(getConfigs());
  const { data: messages, error: messagesError } = use(
    getThreadMessages(params.threadId),
  );

  if (filesError || spacesError || configsError || messagesError) {
    return (
      <div>
        Error: {filesError?.message} {spacesError?.message}{" "}
        {configsError?.message} {messagesError?.message}
      </div>
    );
  }

  return (
    <Thread
      files={files?.data ?? null}
      spaces={spaces?.data?.map((space) => space.space) ?? null}
      configs={configs?.data ?? null}
      messages={messages?.data ?? null}
    />
  );
}
