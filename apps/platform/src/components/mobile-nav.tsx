import Commander from "./commander";
import { SidebarTrigger } from "./ui/sidebar";

export default function MobileNav() {
	return (
		<div className="w-full h-16 bg-background rounded-tl-xl rounded-tr-2xl p-2 fixed bottom-0 flex items-center border-t border-sidebar-ring border-l border-r">
			<SidebarTrigger className="size-10" />
			<Commander />
		</div>
	);
}
