"use client";

import Link from "next/link";

import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

import type { Thread } from "@/types";

type SidebarChatsProps = {
  threads: Thread[] | null;
  currentPath: string;
};

export default function SidebarChats({
  threads,
  currentPath,
}: SidebarChatsProps) {
  return (
    <>
      {threads?.map((thread) => (
        <SidebarMenuItem key={thread.id}>
          <SidebarMenuButton
            isActive={currentPath === `/app/chat/${thread.id}`}
            className="w-full"
            asChild
          >
            <Link href={`/app/chat/${thread.id}`} prefetch>
              <span>{thread.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
}
