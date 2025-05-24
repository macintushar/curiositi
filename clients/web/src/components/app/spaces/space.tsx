import type { Space } from "@/types";
import { Folder, EmptyFolder } from "./folder";

export default function Space({
  text,
  isEmpty = false,
}: {
  text: string;
  isEmpty?: boolean;
}) {
  return (
    <div className="flex w-fit cursor-pointer flex-col items-center gap-3">
      {isEmpty ? (
        <EmptyFolder />
      ) : (
        <Folder strokeClassName="hover:stroke-stone-400 transition delay-20" />
      )}
      <div className={`text-md ${isEmpty ? "text-muted-foreground" : ""}`}>
        {text}
      </div>
    </div>
  );
}
