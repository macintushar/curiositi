"use client";

import AppSidebar from "@/components/app/sidebar/app-sidebar";
import Header from "@/components/app/header";
import Section from "@/components/app/section";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useThreads } from "@/hooks/use-threads";
import GlobalError from "../global-error";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: threads, error: threadsError, isLoading } = useThreads();

  if (threadsError) {
    return <GlobalError error={threadsError} />;
  }

  return (
    <SidebarProvider>
      <div className="bg-background flex h-screen max-h-screen min-h-screen w-full flex-col gap-[16px] overflow-clip overflow-y-scroll p-[16px]">
        <Header />
        <div className="flex min-h-0 flex-1 gap-3">
          <AppSidebar threads={threads?.data ?? null} isLoading={isLoading} />
          <Section className="max-h-full max-w-full overflow-scroll">
            {children}
          </Section>
        </div>
      </div>
    </SidebarProvider>
  );
}
