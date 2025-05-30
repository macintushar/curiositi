import { IconFilePlus } from "@tabler/icons-react";

type UploadFileProps = {
  areFilesInSpace: boolean;
};

export default function UploadFile({ areFilesInSpace }: UploadFileProps) {
  return (
    <div
      className={`border-border bg-muted hover:bg-background w-full rounded-[12px] border-[1px] border-dashed p-5 hover:cursor-pointer ${areFilesInSpace ? "h-fit" : "h-full"}`}
    >
      <div className="flex h-full items-center justify-center gap-2">
        <IconFilePlus className="h-5 w-5" />
        <p className="">Add your files</p>
      </div>
    </div>
  );
}
