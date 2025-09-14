import { env } from "@/env";
import type { NavLink } from "@/types";

export const webMetaData = {
  siteName: "Curiositi",
  description: "Curiositi is an AI-powered search engine for your data.",
  url: env.NEXT_PUBLIC_BASE_URL,
};

export const ghURL = "https://github.com/macintushar/curiositi";

export const navLinks: NavLink[] = [
  { href: "/#features", label: "Features", isExternal: false },
  { href: "/#how-it-works", label: "How It Works", isExternal: false },
  { href: "/#use-cases", label: "Use Cases", isExternal: false },
  { href: "/#pricing", label: "Pricing", isExternal: false },
  { href: "/faq", label: "FAQ", isExternal: false },
];

export const footerLinks: NavLink[] = [
  { href: "/#features", label: "Features", isExternal: false },
  { href: "/faq", label: "FAQ", isExternal: false },
  {
    href: ghURL,
    label: "GitHub",
    isExternal: true,
  },
];
