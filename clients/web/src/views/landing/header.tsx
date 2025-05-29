import Link from "next/link";

import ThemeSwitcher from "@/components/themes/theme-switcher";
import ThemedLogo from "@/components/themes/logo/themed-logo";

import { navLinks } from "@/constants/landing-constants";
import NavLink from "./NavLink";
import CTAButton from "./cta-button";

export default async function Header() {
  return (
    <header className="bg-background/80 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <ThemedLogo />
        </Link>
        <nav className="hidden gap-8 md:flex">
          {navLinks.map((link, idx) => (
            <NavLink key={idx} href={link.href} label={link.label} />
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <CTAButton />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
