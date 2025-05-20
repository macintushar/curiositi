import Link from "next/link";

import ThemeSwitcher from "@/components/themes/theme-switcher";
import ThemedLogo from "@/components/themes/themed-logo";
import { Button } from "@/components/ui/button";

import { navLinks } from "@/constants";
import NavLink from "./NavLink";

export default function Header() {
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
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground hidden text-sm font-medium transition-colors md:block"
          >
            Log In
          </Link>
          <Button variant="default" className="rounded-full">
            Get Started
          </Button>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
