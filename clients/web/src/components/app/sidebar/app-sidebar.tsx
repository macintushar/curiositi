"use client";

import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import SidebarChats from "./sidebar-chats";

import { cn } from "@/lib/utils";
import type { ApiResponse, Thread } from "@/types";
import { IconFolder, IconMessage } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

type AppSidebarProps = {
  threads: {
    data: ApiResponse<Thread[]> | null;
    error: Error | null;
  };
};

export default function AppSidebar({ threads }: AppSidebarProps) {
  const { state } = useSidebar();
  const path = usePathname();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href={`/app/spaces`} prefetch>
                  <SidebarMenuButton
                    isActive={path === "/app/spaces"}
                    className="hover:cursor-pointer"
                  >
                    <IconFolder />
                    Spaces
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href={`/app`} prefetch>
                  <SidebarMenuButton
                    isActive={path === "/app"}
                    className="hover:cursor-pointer"
                  >
                    <IconMessage />
                    Chat
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <div
                className={cn(
                  `hidden h-full w-full flex-col`,
                  state === "collapsed" ? "" : "block",
                )}
              >
                <SidebarChats threads={threads} currentPath={path} />
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarTrigger />
      </SidebarFooter>
    </Sidebar>
  );
}
