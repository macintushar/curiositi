import { use } from "react";

import AppSidebar from "@/components/app/sidebar/app-sidebar";
import Header from "@/components/app/header";
import Section from "@/components/app/section";
import { SidebarProvider } from "@/components/ui/sidebar";

import { getThreads } from "@/services/chats";
import { getSpaces } from "@/services/spaces";
import { getConfigs } from "@/services/configs";
import { getUsersFiles } from "@/services/files";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: threads, error: threadsError } = use(getThreads());
  const { data: files, error: filesError } = use(getUsersFiles());
  const { data: spaces, error: spacesError } = use(getSpaces());
  const { data: configs, error: configsError } = use(getConfigs());

  if (threadsError || filesError || spacesError || configsError) {
    return (
      <div>
        Error: {threadsError?.message} {filesError?.message}{" "}
        {spacesError?.message} {configsError?.message}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="bg-muted flex h-screen max-h-screen min-h-screen w-full flex-col gap-[16px] overflow-clip p-[16px]">
        <Header />
        <div className="flex min-h-0 flex-1 gap-3">
          <AppSidebar threads={threads?.data ?? null} />
          <Section className="max-h-full">{children}</Section>
        </div>
      </div>
    </SidebarProvider>
  );
}
