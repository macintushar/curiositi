"use client";
import { IconFilePlus } from "@tabler/icons-react";
import Image from "next/image";

import emptySpace from "@/assets/images/add-files.svg";
import { toast } from "sonner";
import { handleUpload } from "@/actions/file";
import useChatStore from "@/stores/useChatStore";

type UploadFileProps = {
  areFilesInSpace: boolean;
  spaceId: string;
};

export default function UploadFile({
  areFilesInSpace,
  spaceId,
}: UploadFileProps) {
  const { configs } = useChatStore();

  const handleClick = async () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = configs?.file_types.join(",") ?? "";
    fileInput.size = 1024 * 1024 * 5; // 5MB

    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 1024 * 1024 * 5) {
          toast.error("File size must be less than 5MB");
          return;
        }

        const response = await handleUpload(spaceId, file);
        if (response.error) {
          toast.error(response.error.message);
        }
        if (response.data) {
          if (response.data.data && response.data.data.message) {
            toast.success(response.data.data.message);
          }
          if (response.data.error) {
            toast.error(response.data.error);
          }
        }
      }
    };
    fileInput.click();
  };

  return (
    <div
      onClick={handleClick}
      className={`border-sidebar-border bg-primary-foreground hover:bg-muted w-full rounded-[12px] border-[1px] border-dashed p-5 hover:cursor-pointer ${areFilesInSpace ? "h-fit" : "h-full"}`}
    >
      {areFilesInSpace ? (
        <div className="flex h-full items-center justify-center gap-2">
          <IconFilePlus className="text-muted-foreground h-5 w-5" />
          <p className="text-muted-foreground">Add documents</p>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3">
          <Image
            src={emptySpace as string}
            alt="Empty space"
            width={200}
            height={200}
            className="filter"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="text-brand font-serif text-2xl">
              This space is <span className="italic">empty</span>
            </p>
            <p className="text-muted-foreground text-center text-sm">
              Add documents to your space for context.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
