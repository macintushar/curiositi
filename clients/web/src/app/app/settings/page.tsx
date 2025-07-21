"use client";

import IntegrationsTab from "./integrations-tab";
import ModelsTab from "./models-tab";
import ProfileTab from "./profile-tab";
import TabControl from "./tab-control";
import useSettingsStore from "@/stores/useSettingsStore";

export default function SettingsPage() {
  const { tab } = useSettingsStore();
  return (
    <div className="flex h-full flex-col items-center justify-start overflow-y-auto p-4">
      <div className="flex h-full w-full flex-col gap-4 lg:w-2/3">
        <div className="flex items-center justify-between">
          <h1 className="text-brand font-serif text-4xl font-medium">
            Settings
          </h1>
        </div>
        <div className="flex gap-4">
          <TabControl />
          {tab === "profile" && <ProfileTab />}
          {tab === "models" && <ModelsTab />}
          {tab === "integrations" && <IntegrationsTab />}
        </div>
      </div>
    </div>
  );
}
