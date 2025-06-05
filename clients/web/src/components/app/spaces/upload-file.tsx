import { IconFilePlus } from "@tabler/icons-react";
import Image from "next/image";

import emptySpace from "@/assets/images/add-files.svg";

type UploadFileProps = {
  areFilesInSpace: boolean;
  spaceId: string;
};

export default function UploadFile({
  areFilesInSpace,
  spaceId,
}: UploadFileProps) {
  async function handleUploadFile(file: File) {
    "use server";
    console.log("uploading file", file);
  }

  return (
    <div
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
