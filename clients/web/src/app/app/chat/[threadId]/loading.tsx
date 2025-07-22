"use client";

import { IconPlus } from "@tabler/icons-react";

import MessageInput from "@/components/app/chat/message-input";
import TablerIcon from "@/components/app/tabler-icon";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

function TextSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate keyframes-[shimmer-text] h-3 w-full rounded-sm bg-black dark:bg-white",
        className,
      )}
    ></div>
  );
}

export default function ThreadLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-between gap-2 px-2 py-2">
      <div className="h-full w-full max-w-4xl flex-1 overflow-y-auto">
        <div className="mb-16 flex h-full flex-col justify-between pb-16">
          <div className="flex flex-col gap-4">
            <div className="bg-brand keyframes-[shimmer-text] h-8 w-1/3 opacity-80"></div>
            <Separator className="bg-muted-foreground" />
            <TextSkeleton className="w-full" />
            <TextSkeleton className="w-full" />
            <TextSkeleton className="w-3/4" />
            <TextSkeleton className="w-2/3" />
            <div className="h-12" />
            <TextSkeleton className="w-full" />
            <TextSkeleton className="w-full" />
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-brand keyframes-[shimmer-text] h-8 w-24 opacity-80"></div>
            <Separator className="bg-muted-foreground" />
            <div className="flex items-center justify-between">
              <TextSkeleton className="w-1/4" />
              <TablerIcon Icon={IconPlus} />
            </div>
            <Separator className="bg-muted-foreground" />
            <TextSkeleton className="w-1/4" />
            <Separator className="bg-muted-foreground" />
            <TextSkeleton className="w-1/4" />
          </div>
        </div>
      </div>
      <MessageInput onSubmit={async () => void 0} />
    </div>
  );
}
