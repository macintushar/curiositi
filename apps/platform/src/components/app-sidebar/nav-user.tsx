"use client";

import {
	BadgeCheck,
	Bell,
	ChevronsUpDown,
	CreditCard,
	LogOut,
	type LucideIcon,
	MonitorSmartphone,
	Moon,
	Sun,
} from "lucide-react";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@platform/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@platform/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@platform/components/ui/sidebar";
import { authClient } from "@platform/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import logger from "@curiositi/share/logger";
import { type Theme, useTheme } from "../theme-provider";
import { Skeleton } from "../ui/skeleton";

function SidebarAvatar({
	name,
	email,
	image,
}: {
	name: string;
	email: string;
	image: string;
}) {
	return (
		<>
			<Avatar className="h-8 w-8 rounded-lg">
				<AvatarImage src={image} alt={name} />
				<AvatarFallback className="rounded-lg">
					{name.split(" ")[0][0].toUpperCase()}
					{name.split(" ")[1] ? name.split(" ")[1][0].toUpperCase() : ""}
				</AvatarFallback>
			</Avatar>
			<div className="grid flex-1 text-left text-sm leading-tight">
				<span className="truncate font-medium">{name}</span>
				<span className="truncate text-xs">{email}</span>
			</div>
		</>
	);
}

export function NavUser() {
	const { isMobile } = useSidebar();
	const navigate = useNavigate();
	const { theme, setTheme } = useTheme();

	const { data: session, isPending: isSessionLoading } =
		authClient.useSession();

	if (isSessionLoading) {
		return <Skeleton className="h-12" />;
	}

	if (!session?.session || !session?.user) {
		return null;
	}
	const user = session.user;

	const themes: { label: string; value: Theme; icon: LucideIcon }[] = [
		{
			label: "System",
			value: "system",
			icon: MonitorSmartphone,
		},
		{
			label: "Dark",
			value: "dark",
			icon: Moon,
		},
		{
			label: "Light",
			value: "light",
			icon: Sun,
		},
	];

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<SidebarAvatar
								name={user.name}
								email={user.email}
								image={user.image ?? ""}
							/>
							<ChevronsUpDown className="ml-auto size-4" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						side={isMobile ? "bottom" : "right"}
						align="end"
						sideOffset={4}
					>
						<DropdownMenuLabel className="p-0 font-normal">
							<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<SidebarAvatar
									name={user.name}
									email={user.email}
									image={user.image ?? ""}
								/>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem>
								<BadgeCheck />
								Account
							</DropdownMenuItem>
							<DropdownMenuItem>
								<CreditCard />
								Billing
							</DropdownMenuItem>
							<DropdownMenuItem>
								<Bell />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuSub>
								<DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
								<DropdownMenuPortal>
									<DropdownMenuSubContent sideOffset={10} alignOffset={-50}>
										{themes.map((t) => {
											return (
												<DropdownMenuCheckboxItem
													key={t.value}
													checked={theme === t.value}
													onCheckedChange={() => setTheme(t.value)}
													className="flex items-center justify-between"
												>
													{t.label}
													<code>
														<t.icon className="size-3.5" />
													</code>
												</DropdownMenuCheckboxItem>
											);
										})}
									</DropdownMenuSubContent>
								</DropdownMenuPortal>
							</DropdownMenuSub>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={async () => {
								const { data, error } = await authClient.signOut();
								if (error) {
									logger.error(error);
									toast.error(error.message);
								}
								if (data?.success) {
									toast.success("Signed out successfully");
									navigate({ to: "/sign-in" });
								}
							}}
							variant="destructive"
						>
							<LogOut />
							Sign out
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
