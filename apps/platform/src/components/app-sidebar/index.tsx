"use client";

import type * as React from "react";
import { Home } from "lucide-react";

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
import { MascotLogo } from "../mascot";

const routes = [{ path: "/app", label: "Home", icon: Home }];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { open } = useSidebar();
	const isMobile = useIsMobile();
	const router = useRouterState();

	return (
		<Sidebar collapsible="icon" {...props}>
			<div className="border-b border-b-sidebar-border py-2 flex items-center justify-center w-full gap-1">
				<MascotLogo className="text-[10px] font-bold" />
				{open && "Curiositi"}
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
				<SidebarGroup>
					<SidebarMenu>
						{routes.map((route) => (
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
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter className="border-t border-t-sidebar-border py-2 flex flex-col items-center justify-center">
				<NavUser />
			</SidebarFooter>
		</Sidebar>
	);
}
