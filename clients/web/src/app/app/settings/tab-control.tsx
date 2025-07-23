import { Button } from "@/components/ui/button";
import type { SettingsTab } from "@/types";

import useSettingsStore from "@/stores/useSettingsStore";
import { cn } from "@/lib/utils";

type Tab = {
  label: string;
  value: SettingsTab;
};

const tabs: Tab[] = [
  {
    label: "Profile",
    value: "profile",
  },
  {
    label: "Models",
    value: "models",
  },
  {
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
            currentTab === tab.value && "font-medium",
          )}
          onClick={() => setTab(tab.value)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
