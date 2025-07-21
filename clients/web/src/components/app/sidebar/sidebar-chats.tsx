"use client";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import type { Thread } from "@/types";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { deleteThreadAction } from "@/actions/thread";
import { toast } from "sonner";

type SidebarChatsProps = {
  threads: Thread[] | null;
  currentPath: string;
};

type GroupedThreads = {
  today: Thread[];
  yesterday: Thread[];
  older: Thread[];
};

function groupThreadsByTime(threads: Thread[]): GroupedThreads {
  const now = dayjs();
  const today = now.startOf("day");
  const yesterday = now.subtract(1, "day").startOf("day");

  return threads.reduce<GroupedThreads>(
    (groups, thread) => {
      const threadDate = dayjs(thread.updatedAt);

      if (threadDate.isSame(today, "day")) {
        groups.today.push(thread);
      } else if (threadDate.isSame(yesterday, "day")) {
        groups.yesterday.push(thread);
      } else {
        groups.older.push(thread);
      }

      return groups;
    },
    { today: [], yesterday: [], older: [] },
  );
}

function ThreadActions({
  thread,
  nav,
}: {
  thread: Thread;
  nav: (path: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={async (e) => {
            e.stopPropagation();
          }}
        >
          <IconDotsVertical className="text-muted-foreground size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem
          variant="destructive"
          onClick={async (e) => {
            e.stopPropagation();
            toast.loading("Deleting thread...");
            const res = await deleteThreadAction(thread.id);
            toast.dismiss();
            if (res.error) {
              toast.error(res.error.message);
            }
            if (res.data) {
              if (res.data.error) {
                toast.error(res.data.error);
              }
              if (res.data.data.message) {
                toast.success(res.data.data.message);
                nav("/app");
              } else {
                toast.error("Failed to delete thread");
              }
            } else {
              toast.error("Failed to delete thread");
            }
          }}
        >
          <IconTrash className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ThreadList({
  threads,
  currentPath,
}: {
  threads: Thread[];
  currentPath: string;
}) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-1">
      {threads.map((thread) => (
        <SidebarMenuItem key={thread.id}>
          <SidebarMenuButton
            isActive={currentPath === `/app/chat/${thread.id}`}
            className="h-fit w-full"
            variant="outline"
            asChild
          >
            <div>
              <div
                className="flex w-full items-center justify-between"
                onClick={() => {
                  router.push(`/app/chat/${thread.id}`);
                }}
              >
                <span className="w-full">{thread.title}</span>
              </div>
              <ThreadActions
                thread={thread}
                nav={(path) => router.push(path)}
              />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="text-muted-foreground px-2 py-1 text-xs font-medium">
      {title}
    </div>
  );
}

function ThreadGroup({
  title,
  threads,
  currentPath,
}: {
  title: string;
  threads: Thread[];
  currentPath: string;
}) {
  return (
    <div className="flex flex-col">
      <SectionHeader title={title} />
      <ThreadList threads={threads} currentPath={currentPath} />
    </div>
  );
}

export default function SidebarChats({
  threads,
  currentPath,
}: SidebarChatsProps) {
  if (!threads || threads.length === 0) {
    return null;
  }

  const sortedThreads = threads.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const groupedThreads = groupThreadsByTime(sortedThreads);

  return (
    <div className="flex flex-col gap-2">
      {groupedThreads.today.length > 0 && (
        <ThreadGroup
          title="Today"
          threads={groupedThreads.today}
          currentPath={currentPath}
        />
      )}

      {groupedThreads.yesterday.length > 0 && (
        <ThreadGroup
          title="Yesterday"
          threads={groupedThreads.yesterday}
          currentPath={currentPath}
        />
      )}

      {groupedThreads.older.length > 0 && (
        <ThreadGroup
          title="Older"
          threads={groupedThreads.older}
          currentPath={currentPath}
        />
      )}
    </div>
  );
}
