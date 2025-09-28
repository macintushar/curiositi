import { env } from "@/env";
import type { NavLink } from "@/types";
import { docsURL, ghURL } from "./app-constants";

export const webMetaData = {
  siteName: "Curiositi",
  description: "Curiositi is an AI-powered search engine for your data.",
  url: env.NEXT_PUBLIC_BASE_URL,
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Home", isExternal: false },
  { href: "/faq", label: "FAQ", isExternal: false },
  { href: docsURL, label: "Docs", isExternal: true },
];

export const footerLinks: NavLink[] = [
  { href: "/#features", label: "Features", isExternal: false },
  { href: "/faq", label: "FAQ", isExternal: false },
  {
    href: docsURL,
    label: "Docs",
    isExternal: true,
  },
  {
    href: ghURL,
    label: "GitHub",
    isExternal: true,
  },
];
