"use server";

import { deleteSpace as deleteSpaceService } from "@/services/spaces";
import { revalidatePath } from "next/cache";

export const deleteSpace = async (id: string) => {
  const { data, error } = await deleteSpaceService(id);
  revalidatePath(`/app/spaces`);

  return { data, error };
};
