import type { Space } from "@/types";
import { Folder, EmptyFolder, Files } from "./folder";

export default function Space({
  text,
  isEmpty = false,
  icon,
  fileCount = 0,
}: {
  text: string;
  icon?: string;
  isEmpty?: boolean;
  fileCount?: number;
}) {
  return (
    <div className="flex w-fit cursor-pointer flex-col items-center gap-3">
      {isEmpty ? (
        <EmptyFolder />
      ) : (
        <div className="group relative filter transition-all duration-300 hover:drop-shadow-lg">
          <p className="text-muted-foreground absolute bottom-4 left-4 text-xs opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100">
            {fileCount} Source{fileCount === 1 ? "" : "s"}
          </p>

          <Folder borderClassName="stroke-stone-200 stroke-2 transition-all duration-300 group-hover:stroke-stone-300" />
          <Files className="absolute -top-8 left-1/2 -z-10 -translate-x-1/2 translate-y-5 opacity-0 transition-all duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100" />
        </div>
      )}
      <div
        className={`flex items-center justify-center gap-1 ${isEmpty ? "text-muted-foreground" : ""}`}
      >
        {icon && <p>{icon}</p>}
        <p>{text}</p>
      </div>
    </div>
  );
}
