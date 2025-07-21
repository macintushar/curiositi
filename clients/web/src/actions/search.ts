"use server";

import { sendMessage } from "@/services/chats";
import type { ApiResponse, ThreadMessage } from "@/types";
import { revalidatePath } from "next/cache";

export async function search({
  input,
  model,
  provider,
  thread_id,
  space_ids = [],
  file_ids = [],
}: {
  input: string;
  model: string;
  provider: string;
  thread_id: string;
  space_ids: string[];
  file_ids: string[];
}): Promise<{
  data: ApiResponse<ThreadMessage> | null;
  error: string | null;
}> {
  const { data, error } = await sendMessage(
    input,
    model,
    provider,
    thread_id,
    space_ids,
    file_ids,
  );
  revalidatePath(`/app/chat/${thread_id}`);
  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }
  return {
    data: data,
    error: null,
  };
}
