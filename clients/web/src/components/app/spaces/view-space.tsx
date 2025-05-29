// "use client";

// import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Space from "@/components/app/spaces/space";

import type { ApiResponse, MessageResponse, SpaceResponse } from "@/types";
import UploadFile from "./upload-file";
import FileItem from "./file-item";
import { deleteFile, getFilesInSpace } from "@/services/spaces";
import { toast } from "sonner";
import { revalidatePath } from "next/cache";

type ViewSpaceDialogProps = {
  space: SpaceResponse;
};

export default async function ViewSpaceDialog({ space }: ViewSpaceDialogProps) {
  //   const [open, setOpen] = useState(false);

  const { data, error } = await getFilesInSpace(space.space.id);

  if (error) {
    toast.error(error.message);
    return <h1>Error: {error.message}</h1>;
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Space
          text={space.space.name}
          icon={space.space.icon}
          fileCount={space.files}
        />
      </DialogTrigger>
      <DialogContent className="flex h-[560px] w-[560px] flex-col">
        <DialogHeader>
          <DialogTitle>Space context</DialogTitle>
        </DialogHeader>
        <div className="flex h-full flex-col space-y-4">
          <UploadFile
            areFilesInSpace={(data?.data && data.data.length > 0) ?? false}
          />
          {data?.data.map((fileItem) => (
            <FileItem
              file={fileItem}
              handleGetFile={async () => {
                "use server";
                console.log("downloading file");
              }}
              handleDeleteFile={async () => {
                "use server";
                const result = await deleteFile(space.space.id, fileItem.id);

                if (result.data?.message) {
                  revalidatePath("/app/spaces");
                }

                return result as ApiResponse<MessageResponse>;
              }}
              key={fileItem.id}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
