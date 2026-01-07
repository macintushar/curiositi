import { AppSidebar } from "@platform/components/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	useSidebar,
} from "@platform/components/ui/sidebar";
import { useIsMobile } from "@platform/hooks/use-mobile";

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

export default function AppLayout({ children }: React.PropsWithChildren) {
	const isMobile = useIsMobile();
	return (
		<SidebarProvider>
			<AppSidebar />
			<div className="flex min-h-svh max-h-svh w-fit h-svh flex-col bg-accent px-1.5">
				{!isMobile && (
					<div className="flex h-full items-center">
						<DesktopSidebarTrigger />
					</div>
				)}
			</div>

			<div className="flex min-h-svh max-h-svh w-full h-svh flex-col p-4 bg-accent">
				<SidebarInset className="h-full bg-accent">{children}</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
