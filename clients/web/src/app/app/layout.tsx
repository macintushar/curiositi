import { use } from "react";

import AppSidebar from "@/components/app/sidebar/app-sidebar";
import Header from "@/components/app/header";
import Section from "@/components/app/section";
import { SidebarProvider } from "@/components/ui/sidebar";

import { getThreads } from "@/services/chats";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: threads, error: threadsError } = use(getThreads());

  if (threadsError) {
    return <div>Error: {threadsError?.message}</div>;
  }

  return (
    <SidebarProvider>
      <div className="bg-background flex h-screen max-h-screen min-h-screen w-full flex-col gap-[16px] overflow-clip p-[16px]">
        <Header />
        <div className="flex min-h-0 flex-1 gap-3">
          <AppSidebar threads={threads?.data ?? null} />
          <Section className="max-h-full">{children}</Section>
        </div>
      </div>
    </SidebarProvider>
  );
}
