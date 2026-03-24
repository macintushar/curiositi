"use client";

import { AppSidebar } from "@platform/components/app-sidebar";
import SettingsDialog from "@platform/components/dialogs/settings-dialog";
import MobileNav from "@platform/components/mobile-nav";
import {
	SidebarInset,
	SidebarProvider,
	useSidebar,
} from "@platform/components/ui/sidebar";
import { NavigationHistoryProvider } from "@platform/contexts/navigation-history-context";
import { useIsMobile } from "@platform/hooks/use-mobile";
import { cn } from "@platform/lib/utils";
import { MailIcon } from "lucide-react";
import dayjs from "dayjs";
import { authClient } from "@platform/lib/auth-client";
import { Badge } from "@platform/components/ui/badge";

function DesktopSidebarTrigger() {
	const { toggleSidebar } = useSidebar();
	return (
		<button
			onClick={toggleSidebar}
			type="button"
			className="h-10 hover:h-12 transition-all duration-200 w-1.5 rounded-2xl bg-muted-foreground"
		/>
	);
}

enum GreetingType {
	Morning = "🌅 Good morning",
	Afternoon = "🌇 Good afternoon",
	Night = "🌕 up late",
}

type SplitTime = {
	hour: number;
	minute: number;
};

function Greeting({ name }: { name?: string }) {
	const now = dayjs();
	const time24h = now.format("HH:mm");

	const timeSplit: SplitTime = {
		hour: parseInt(time24h.split(" ")[0].split(":")[0]),
		minute: parseInt(time24h.split(" ")[0].split(":")[1]),
	};

	const greeting =
		timeSplit.hour < 12 && timeSplit.hour > 4
			? GreetingType.Morning
			: timeSplit.hour > 12 && timeSplit.hour < 18
				? GreetingType.Afternoon
				: GreetingType.Night;

  return (
    <div className="flex gap-2 items-center">
		<h1 className="text-lg font-mono tracking-tight">
			{greeting},
      </h1>
      <Badge className="rounded-none p-0.5 h-fit w-fit bg-foreground dark:bg-muted">
				<p className="text-lg font-doto tracking-wider pl-1 text-white leading-none font-semibold">
				{name ?? "curious user"}
				</p>
         </Badge>
    </div>
	);
}

export default function AppLayout({ children }: React.PropsWithChildren) {
	const isMobile = useIsMobile();
	const { data: session } =
		authClient.useSession();
	return (
		<NavigationHistoryProvider>
			<SidebarProvider>
				<AppSidebar />
				<div className="flex min-h-svh max-h-svh w-fit h-svh flex-col bg-accent px-1.5 overflow-hidden">
					{!isMobile && (
						<div className="flex h-full items-center">
							<DesktopSidebarTrigger />
						</div>
					)}
				</div>

				<div
					className={cn(
						"flex min-h-full max-h-screen w-full overflow-clip flex-col p-4 pl-0 bg-accent",
						isMobile ? "pl-1.5" : ""
					)}
				>
					<SidebarInset
						className={cn(
							"h-fit max-h-screen bg-accent",
							isMobile ? "mb-14" : ""
						)}
					>
						<main className="w-full h-fit max-h-screen">
							<div className="flex items-center gap-3 mb-2 px-6">
								<Greeting name={session?.user.name} />
							</div>
							{children}
						</main>
					</SidebarInset>
				</div>
				{isMobile && <MobileNav />}
			</SidebarProvider>
		</NavigationHistoryProvider>
	);
}
