"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconFolders, IconFoldersFilled, IconPlus } from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import SidebarChats from "./sidebar-chats";

import { cn } from "@/lib/utils";
import type { Thread } from "@/types";
import useThreadStore from "@/stores/useThreadStore";

type AppSidebarProps = {
  threads: Thread[] | null;
  isLoading?: boolean;
};

export default function AppSidebar({ threads, isLoading }: AppSidebarProps) {
  const { state } = useSidebar();
  const path = usePathname();

  const { clearMessages } = useThreadStore();

  const isSpaces = path === "/app/spaces";

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu className="flex flex-col gap-3">
          <SidebarMenuItem>
            <Link href={`/app`} prefetch>
              <Button
                variant="outline"
                className="w-full cursor-pointer truncate font-light"
                onClick={() => {
                  clearMessages();
                }}
              >
                <IconPlus />
                {state === "collapsed" ? "" : "New Thread"}
              </Button>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href={`/app/spaces`} prefetch>
              <SidebarMenuButton
                isActive={isSpaces}
                className="py-5 hover:cursor-pointer"
              >
                {isSpaces ? <IconFoldersFilled /> : <IconFolders />}
                Spaces
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu
              className={cn(
                `hidden h-full flex-col`,
                state === "collapsed" ? "" : "block",
              )}
            >
              <SidebarGroupLabel>Your Chats</SidebarGroupLabel>
              <SidebarChats
                threads={threads}
                currentPath={path}
                isLoading={isLoading}
              />
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
