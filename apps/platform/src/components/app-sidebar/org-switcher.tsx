import { Briefcase, ChevronsUpDown, Plus } from "lucide-react";

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@platform/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@platform/components/ui/sidebar";
import { authClient } from "@platform/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";
import OrgDialog from "../org-dialog";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

export function OrgSwitcher() {
	const { isMobile } = useSidebar();
	const { data: activeOrg, isPending: isActiveOrgLoading} = authClient.useActiveOrganization();
	const { data: orgs, isPending: isOrgsLoading } = authClient.useListOrganizations();

	const [open, setOpen] = useState(false);

  if (isActiveOrgLoading || isOrgsLoading) {
    return <Skeleton className="h-12" />
	}
	if (!activeOrg || !orgs) {
		return null;
	}

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
								<Briefcase className="size-4" />
							</div>
							<div className="grid flex-1 text-left text-sm leading-tight gap-1">
                <span className="truncate font-medium">{activeOrg.name}</span>
								<Badge variant="secondary" className="rounded-none w-fit p-0.5">
								<code className="truncate text-xs leading-none tracking-wider text-muted-foreground font-semibold">
									{activeOrg.slug}
                  </code>
								</Badge>
							</div>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Your Workspaces
						</DropdownMenuLabel>
						{orgs.map((org) => (
							<DropdownMenuCheckboxItem
								key={org.name}
								onClick={async () => {
									const res = await authClient.organization.setActive({
										organizationId: org.id,
										organizationSlug: org.slug,
									});
									if (res.error) {
										toast.error(res.error.message);
									}
									if (res.data?.id) {
										toast.success(`Workspace changed to: ${org.name}`);
									}
								}}
								checked={org.id === activeOrg.id}
								checkboxSide="right"
							>
								<div className="flex size-6 items-center justify-center rounded-md border">
									<Briefcase className="size-3.5 shrink-0" />
								</div>
								{org.name}
							</DropdownMenuCheckboxItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => setOpen(true)}
							className="gap-2 p-2"
						>
							<div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
								<Plus className="size-4" />
							</div>
							<div className="text-muted-foreground font-medium">
								Create Workspace
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<OrgDialog mode="create" open={open} onOpenChange={setOpen} />
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
