"use client";

import type * as React from "react";
import { Home, Bell, MessageCircle } from "lucide-react";

import { NavUser } from "./nav-user";
import { OrgSwitcher } from "./org-switcher";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@platform/components/ui/sidebar";
import { Link, useRouterState } from "@tanstack/react-router";
import Commander from "../commander";
import { useIsMobile } from "@platform/hooks/use-mobile";
import Mascot from "../mascot";
import { cn } from "@platform/lib/utils";
import type { FileRouteTypes } from "@platform/routeTree.gen";
import { IconSettings, IconSunMoon } from "@tabler/icons-react";
import useAppStore from "@platform/stores/appStore";
import SettingsDialog from "../dialogs/settings-dialog";

import { DropdownSwitcher } from "../theme/switcher";
import ChatConversations from "./chat-conversations";

type Route = {
	path: FileRouteTypes["to"];
	label: string;
	position: "main" | "secondary";
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const routes: Route[] = [
	{
		path: "/app",
		label: "Home",
		position: "main",
		icon: Home,
	},
	{
		path: "/app/chat",
		label: "Chat with AI",
		position: "main",
		icon: MessageCircle,
	},
	{
		path: "/app/notifications",
		label: "Notifications",
		position: "secondary",
		icon: Bell,
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { open } = useSidebar();
	const isMobile = useIsMobile();
	const router = useRouterState();
	const { isSettingsDialogOpen, toggleSettingsDialog } = useAppStore();

	return (
		<Sidebar collapsible="icon" {...props}>
			<div className="border-b border-b-sidebar-border font-bold py-2 px-4 flex items-center justify-center w-full gap-2">
				<Mascot className={cn("text-xs font-black", !open && "text-[10px]")} />
				{open && <p className="font-doto text-xl leading-none">curiositi</p>}
			</div>
			<SidebarHeader className="border-b border-b-sidebar-border py-2 flex flex-col items-center justify-center">
				<OrgSwitcher />
			</SidebarHeader>
			<SidebarContent>
				{!isMobile && (
					<SidebarGroup className="border-b border-b-sidebar-border">
						<Commander />
					</SidebarGroup>
				)}
				<div className="flex flex-col items-center justify-between h-full">
					<SidebarGroup>
						<SidebarMenu>
							{routes.map(
								(route) =>
									route.position === "main" && (
										<SidebarMenuItem key={route.path}>
											<SidebarMenuButton
												tooltip={route.label}
												isActive={router.location.pathname === route.path}
												asChild
											>
												<Link to={route.path}>
													<route.icon />
													<span>{route.label}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									)
							)}
							<ChatConversations />
						</SidebarMenu>
					</SidebarGroup>
					<SidebarGroup className="space-y-2">
						<SidebarMenu>
							{routes.map(
								(route) =>
									route.position === "secondary" && (
										<SidebarMenuItem key={route.path}>
											<SidebarMenuButton
												tooltip={route.label}
												isActive={router.location.pathname === route.path}
												asChild
											>
												<Link to={route.path}>
													<route.icon />
													<span>{route.label}</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
									)
							)}
							<SidebarMenuItem>
								<SidebarMenuButton
									tooltip="Settings"
									onClick={() => toggleSettingsDialog(!isSettingsDialogOpen)}
									isActive={isSettingsDialogOpen}
								>
									<IconSettings />
									<span>Settings</span>
								</SidebarMenuButton>
								<SettingsDialog />
							</SidebarMenuItem>
						</SidebarMenu>
						<SidebarMenu>
							<DropdownSwitcher
								trigger={
									<SidebarMenuButton>
										<IconSunMoon />
										Theme
									</SidebarMenuButton>
								}
							/>
						</SidebarMenu>
					</SidebarGroup>
				</div>
			</SidebarContent>
			<SidebarFooter className="border-t border-t-sidebar-border py-2 flex flex-col items-center justify-center">
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
