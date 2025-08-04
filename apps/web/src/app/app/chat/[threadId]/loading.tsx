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
        "h-3 w-full animate-pulse rounded-sm bg-black dark:bg-white",
        className,
      )}
    ></div>
  );
}

function RelatedSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <TextSkeleton className="w-1/4" />
      <TablerIcon Icon={IconPlus} className="animate-pulse" />
    </div>
  );
}

export default function ThreadLoading() {
  return (
    <div className="flex h-full flex-col items-center justify-between gap-2 px-2 py-2">
      <div className="h-full w-full max-w-4xl flex-1 overflow-y-auto">
        <div className="mb-16 flex h-full flex-col space-y-32 pb-16">
          <div className="flex flex-col gap-4">
            <div className="bg-brand h-8 w-1/3 animate-pulse opacity-80"></div>
            {/* title skeleton */}
            <Separator className="bg-muted-foreground" />
            <TextSkeleton className="w-full" />
            <TextSkeleton className="w-full" />
            <TextSkeleton className="w-3/4" />
            <TextSkeleton className="w-2/3" />
            <div className="h-1" /> {/* breakpoint skeleton */}
            <TextSkeleton className="w-full" />
            <TextSkeleton className="w-full" />
            <Separator className="bg-muted-foreground mt-8" />
          </div>
          <div className="flex flex-col gap-4">
            {/* related skeleton */}
            <div className="bg-brand h-6 w-24 animate-pulse opacity-80"></div>
            {/* related title skeleton */}
            <Separator className="bg-muted-foreground" />
            {/* related item skeleton */}
            <RelatedSkeleton />
            <Separator className="bg-muted-foreground" />
            <RelatedSkeleton />
            <Separator className="bg-muted-foreground" />
            <RelatedSkeleton />
          </div>
        </div>
      </div>
      <MessageInput onSubmit={async () => void 0} />
    </div>
  );
}
