import AppSidebar from "@/components/app/sidebar/app-sidebar";
import Header from "@/components/app/header";
import Section from "@/components/app/section";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { getThreads } from "@/services/chats";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const threads = await getThreads();

  return (
    <SidebarProvider>
      <SidebarInset>
        <div className="bg-muted flex h-screen max-h-screen min-h-screen flex-col gap-[16px] p-[16px]">
          <Header />
          <div className="flex h-full gap-3">
            <AppSidebar threads={threads} />
            <Section className="max-h-full overflow-auto p-4">
              {children}
            </Section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
