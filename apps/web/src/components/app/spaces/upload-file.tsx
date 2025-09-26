"use client";
import { IconFilePlus, IconFileUpload } from "@tabler/icons-react";
import Image from "next/image";

import emptySpace from "@/assets/images/add-files.svg";
import { toast } from "sonner";
import useChatStore from "@/stores/useChatStore";
import { useUploadFile } from "@/hooks/use-spaces";

type UploadFileProps = {
  areFilesInSpace: boolean;
  spaceId: string;
  refetch: () => void;
};

export default function UploadFile({
  areFilesInSpace,
  spaceId,
  refetch,
}: UploadFileProps) {
  const { configs } = useChatStore();
  const { mutate: uploadFile, data, isPending, error } = useUploadFile();

  const handleClick = async () => {
    const fileInput = document.createElement("input");
    fileInput.disabled = isPending;
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

        uploadFile({ spaceId, file });

        if (error) {
          toast.error(error.message);
          void refetch();
        }

        if (data) {
          if (data.data && data.data.message) {
            toast.success(data.data.message);
            void refetch();
          }
          if (data.error) {
            toast.error(data.error);
            void refetch();
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
      {isPending ? (
        <div className="flex h-full animate-pulse items-center justify-center gap-2">
          <IconFileUpload className="text-muted-foreground size-5" />
          <p className="text-muted-foreground">Uploading</p>
        </div>
      ) : areFilesInSpace ? (
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
