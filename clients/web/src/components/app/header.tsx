import Link from "next/link";
import ThemeSwitcher from "../themes/theme-switcher";
import ThemedLogo from "../themes/logo/themed-logo";

import Section from "./section";
import { Profile } from "./profile";
import { SidebarTrigger } from "../ui/sidebar";

export default function Header() {
  return (
    <Section className="h-[64px] px-[20px] py-[16px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5">
          <div className="block sm:hidden">
            <SidebarTrigger />
          </div>
          <Link href="/app" prefetch={true}>
            <ThemedLogo />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitcher className="rounded-md" variant="ghost" />
          <Profile />
        </div>
      </div>
    </Section>
  );
}
