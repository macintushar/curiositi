import { revalidatePath } from "next/cache";
import { IconDotsVertical } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import FileItem from "@/components/app/spaces/file-item";
import UploadFile from "@/components/app/spaces/upload-file";

import { deleteFile, getFilesInSpace, getSpace } from "@/services/spaces";
import type { ApiResponse, MessageResponse } from "@/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default async function Space({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const { data, error } = await getSpace(spaceId);
  const { data: files, error: filesError } = await getFilesInSpace(spaceId);

  if (error || filesError) {
    return (
      <div>
        Error: {error?.message}
        {filesError?.message}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-start p-4">
      <div className="flex h-full w-full flex-col gap-4 md:w-2/3 md:pt-40">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-3xl font-medium">
            <h1>
              {data?.data.space.icon} {data?.data.space.name}
            </h1>
          </div>
          <Button variant="ghost" size="icon">
            <IconDotsVertical />
          </Button>
        </div>
        <div className="flex max-h-full min-h-0 flex-1 flex-col gap-6">
          <UploadFile
            spaceId={spaceId}
            areFilesInSpace={(files?.data && files.data.length > 0) ?? false}
          />
          <ScrollArea className="flex h-full max-h-full w-full flex-1 flex-col">
            {files?.data.map((fileItem) => (
              <FileItem
                file={fileItem}
                handleGetFile={async () => {
                  "use server";
                  console.log("downloading file");
                }}
                handleDeleteFile={async () => {
                  "use server";
                  const result = await deleteFile("1", fileItem.id);

                  if (result.data?.message) {
                    revalidatePath("/app/spaces");
                  }

                  return result as ApiResponse<MessageResponse>;
                }}
                key={fileItem.id}
              />
            ))}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
