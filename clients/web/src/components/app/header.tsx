import Link from "next/link";
import ThemeSwitcher from "../themes/theme-switcher";
import ThemedLogo from "../themes/logo/themed-logo";

import Section from "./section";
import { IconFolder } from "@tabler/icons-react";
import NavButton from "./nav-button";
import { Profile } from "./profile";

const navLinks: { icon: React.ReactNode; link: string; label: string }[] = [
  {
    link: "/app/spaces",
    icon: <IconFolder className="size-5" />,
    label: "Spaces",
  },
];

export default function Header() {
  return (
    <Section className="h-[64px] px-[20px] py-[16px]">
      <div className="flex items-center justify-between">
        <Link href="/app" prefetch={true}>
          <ThemedLogo />
        </Link>
        <div className="flex items-center gap-2">
          {navLinks.map((link) => (
            <NavButton
              key={link.link}
              href={link.link}
              icon={link.icon}
              label={link.label}
            />
          ))}

          <ThemeSwitcher className="rounded-md" variant="ghost" />

          <Profile />
        </div>
      </div>
    </Section>
  );
}
