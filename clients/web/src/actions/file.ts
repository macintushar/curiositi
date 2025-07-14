"use server";
import { uploadFile } from "@/services/spaces";
import { revalidatePath } from "next/cache";

export const handleUpload = async (spaceId: string, file: File) => {
  try {
    const response = await uploadFile(spaceId, file);
    revalidatePath(`/app/spaces/${spaceId}`);
    return response;
  } catch (error) {
    console.error("Upload error:", error);
    return { data: null, error: error as Error };
  }
};
