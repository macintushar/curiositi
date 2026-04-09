import useAppStore from "@platform/stores/appStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import {
	type Icon,
	IconBriefcase2,
	IconUser,
	IconSettings,
	IconSearch,
	IconTool,
	IconRobot,
} from "@tabler/icons-react";
import { SidebarMenuButton } from "../ui/sidebar";
import { useState, useEffect } from "react";
import WorkspaceSettings from "../settings/workspace-settings";
import ProfileSettings from "../settings/profile-settings";
import ModelsSettings from "../settings/models-settings";
import SearchSettings from "../settings/search-settings";
import ToolsSettings from "../settings/tools-settings";
import AgentSettings from "../settings/agent-settings";

type SettingsTabs =
	| "profile"
	| "workspace"
	| "models"
	| "search"
	| "tools"
	| "agent";

type MenuItem = {
	label: string;
	Icon: Icon;
	value: SettingsTabs;
};

const menus: MenuItem[] = [
	{ label: "Profile", Icon: IconUser, value: "profile" },
	{ label: "Workspace", Icon: IconBriefcase2, value: "workspace" },
	{ label: "Models", Icon: IconSettings, value: "models" },
	{ label: "Search", Icon: IconSearch, value: "search" },
	{ label: "Tools", Icon: IconTool, value: "tools" },
	{ label: "Agent", Icon: IconRobot, value: "agent" },
];

export default function SettingsDialog() {
	const [activeTab, setActiveTab] = useState<SettingsTabs>("profile");
	const { toggleSettingsDialog, settingsDialogInitialTab } = useAppStore();
	const isSettingsDialogOpen = useAppStore(
		(state) => state.isSettingsDialogOpen
	);

	useEffect(() => {
		if (isSettingsDialogOpen && settingsDialogInitialTab) {
			setActiveTab(settingsDialogInitialTab);
		}
	}, [isSettingsDialogOpen, settingsDialogInitialTab]);

	return (
		<Dialog open={isSettingsDialogOpen} onOpenChange={toggleSettingsDialog}>
			<DialogContent
				className="w-full gap-0 h-full flex flex-col min-w-full max-w-full p-2 pl-4 sm:min-w-5/6 sm:max-h-2/3"
				showCloseButton={true}
			>
				<div className="flex gap-4 h-full">
					<div className="w-1/4 py-1 max-h-full overflow-y-auto no-scrollbar flex flex-col gap-3">
						<DialogHeader className="h-fit">
							<DialogTitle>Settings</DialogTitle>
						</DialogHeader>
						<Separator />
						<div className="flex flex-col gap-1">
							{menus.map((menu) => (
								<SidebarMenuButton
									key={menu.value}
									isActive={activeTab === menu.value}
									className="hover:cursor-pointer"
									onClick={() => setActiveTab(menu.value)}
								>
									<menu.Icon />
									{menu.label}
								</SidebarMenuButton>
							))}
						</div>
					</div>
					<div className="w-full p-4 bg-muted rounded-xl border border-border overflow-auto">
						{activeTab === "profile" && <ProfileSettings />}
						{activeTab === "workspace" && <WorkspaceSettings />}
						{activeTab === "models" && <ModelsSettings />}
						{activeTab === "search" && <SearchSettings />}
						{activeTab === "tools" && <ToolsSettings />}
						{activeTab === "agent" && <AgentSettings />}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
