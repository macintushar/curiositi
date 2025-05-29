"use client";

import Link from "next/link";
import { IconChevronRight } from "@tabler/icons-react";

import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import type { ApiResponse, Thread } from "@/types";

type SidebarChatsProps = {
  threads: {
    data: ApiResponse<Thread[]> | null;
    error: Error | null;
  };
  currentPath: string;
};

export default function SidebarChats({
  threads,
  currentPath,
}: SidebarChatsProps) {
  if (threads.error && !threads.data) {
    return <h1>Error: {threads.error.message}</h1>;
  }
  return (
    <Collapsible className="group/collapsible" defaultOpen asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="text-muted-foreground flex justify-between">
            Your chats
            <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {threads.data?.data.map((thread) => (
              <SidebarMenuSubItem key={thread.id}>
                <SidebarMenuSubButton
                  isActive={currentPath === `/app/chat/${thread.id}`}
                  asChild
                >
                  <Link href={`/app/chat/${thread.id}`} prefetch>
                    <span>{thread.id}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
