"use client";

import type * as React from "react";
import { Folder, Home } from "lucide-react";

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

const routes = [
	{ path: "/app", label: "Home", icon: Home },
	{ path: "/app/spaces", label: "Spaces", icon: Folder },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { open } = useSidebar();
	const router = useRouterState();

	return (
		<Sidebar collapsible="icon" {...props}>
			<div className="border-b border-b-sidebar-border py-2 flex items-center justify-center w-full">
				{open ? "Curiositi" : "C"}
			</div>
			<SidebarHeader className="border-b border-b-sidebar-border py-2 flex flex-col items-center justify-center">
				<OrgSwitcher />
			</SidebarHeader>
			<SidebarContent>
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
