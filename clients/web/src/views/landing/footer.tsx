import ThemedLogo from "@/components/themes/themed-logo";
import Link from "next/link";
import { footerLinks } from "@/constants/landing-constants";

export default function Footer() {
  return (
    <footer className="bg-background w-full border-t">
      <div className="flex flex-col gap-8 px-4 py-8 md:px-6">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:gap-8">
          <Link href="/" className="flex items-center gap-2">
            <ThemedLogo />
          </Link>
          <nav className="flex flex-wrap gap-6 md:ml-auto">
            {footerLinks.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                target={link.isExternal ? "_blank" : "_self"}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} Curiositi. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
