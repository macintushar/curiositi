import { Button } from "@/components/ui/button";
import type { SettingsTab } from "@/types";

import useSettingsStore from "@/stores/useSettingsStore";
import { cn } from "@/lib/utils";
import {
  IconBrain,
  IconPlug,
  IconUserCircle,
  type Icon,
} from "@tabler/icons-react";
import TablerIcon from "@/components/app/tabler-icon";

type Tab = {
  Icon: Icon;
  label: string;
  value: SettingsTab;
};

const tabs: Tab[] = [
  {
    Icon: IconUserCircle,
    label: "Profile",
    value: "profile",
  },
  {
    Icon: IconBrain,
    label: "Models",
    value: "models",
  },
  {
    Icon: IconPlug,
    label: "Integrations",
    value: "integrations",
  },
];

export default function TabControl() {
  const { tab: currentTab, setTab } = useSettingsStore();

  return (
    <div className="flex flex-col gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.value}
          variant="ghost"
          className={cn(
            "w-32 cursor-pointer justify-start text-start text-sm font-light",
            currentTab === tab.value && "text-brand font-medium",
          )}
          onClick={() => setTab(tab.value)}
        >
          <TablerIcon Icon={tab.Icon} className="size-4" />
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
