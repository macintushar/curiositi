import Header from "@/components/app/header";
import Section from "@/components/app/section";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen max-h-screen min-h-screen flex-col gap-[16px] p-[16px]">
      <Header />
      <Section>
        <main className="h-full w-full p-4">{children}</main>
      </Section>
    </div>
  );
}
