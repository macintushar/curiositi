"use client";

import { Button } from "@/components/ui/button";

import { formatFileSize, formatTimestamp, getFileType } from "@/lib/utils";

import type {
  ApiResponse,
  File as CuriositiFile,
  MessageResponse,
} from "@/types";

type FileDownloadResult =
  | {
      data: Blob;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

import { IconDownload, IconTrashX, type Icon } from "@tabler/icons-react";

import { toast } from "sonner";

export function FileIcon({ icon: FileTypeIcon }: { icon: Icon }) {
  return (
    <div className="flex size-10 items-center justify-center rounded-lg border-[1px] border-stone-700 bg-stone-600 bg-radial from-stone-500 to-stone-600 shadow-lg">
      <FileTypeIcon className="size-5 text-white" />
    </div>
  );
}

type FileItemProps = {
  file: CuriositiFile;
  handleGetFile: () => Promise<FileDownloadResult>;
  handleDeleteFile: () => Promise<ApiResponse<MessageResponse>>;
};

export default function FileItem({
  file,
  handleGetFile,
  handleDeleteFile,
}: FileItemProps) {
  const { label, icon } = getFileType(file.type);

  return (
    <div className="dark:bg-sidebar mb-2 flex h-fit items-center justify-between rounded-xl border-[1px] bg-white p-3 transition-all duration-300 hover:cursor-pointer hover:shadow-md">
      <div className="flex max-h-full gap-3 overflow-hidden">
        <FileIcon icon={icon} />
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-medium">{file.name}</h3>
          <p className="text-muted-foreground text-xs">
            {label.toUpperCase()} · {formatFileSize(file.fileSize)} ·{" "}
            {formatTimestamp(file.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          className="size-7 hover:cursor-pointer"
          variant="ghost"
          onClick={async () => {
            const file = await handleGetFile();
            console.log("file", file);
            if (file.data) {
              const url = URL.createObjectURL(file.data);
              window.open(url, "_blank");
            } else if (file.error) {
              toast.error(file.error);
            }
          }}
        >
          <IconDownload className="text-brand size-4" />
        </Button>
        <Button
          className="size-7 hover:cursor-pointer"
          variant="ghost"
          onClick={async () => {
            const { data, error } = await handleDeleteFile();

            console.log("data", data);

            if (data.message) {
              toast.success(data.message);
            }

            if (error) {
              toast.error(error);
            }
          }}
        >
          <IconTrashX className="text-brand size-4" />
        </Button>
      </div>
    </div>
  );
}
