"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const currentPath = usePathname();
  return (
    <Link
      href={href}
      className={`text-muted-foreground hover:text-foreground text-sm font-medium transition-colors ${
        currentPath === href ? "active text-primary" : ""
      }`}
    >
      {label}
    </Link>
  );
}
