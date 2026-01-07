import { AppSidebar } from "@platform/components/app-sidebar";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@platform/components/ui/sidebar";

export default function AppLayout({ children }: React.PropsWithChildren) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<div className="flex min-h-svh max-h-svh w-full h-svh flex-col p-4 bg-accent">
				<SidebarInset className="h-full bg-accent">
					<SidebarTrigger className="-ml-1" />
					{children}
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
