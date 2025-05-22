"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { profileLinks } from "@/constants/app-constants";
import { signOut } from "@/lib/auth-client";

import { IconLogout, IconUser } from "@tabler/icons-react";
import Link from "next/link";

export function Profile() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <IconUser className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="bottom" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profileLinks.map((group, idx) => (
          <div key={idx}>
            <DropdownMenuGroup>
              {group.links.map((link) => (
                <Link
                  href={link.url}
                  key={link.label}
                  className="cursor-pointer"
                  target={link.isLinkExternal ? "_blank" : "_self"}
                  prefetch={link.isLinkExternal ? false : true}
                >
                  <DropdownMenuItem>
                    {link.icon}
                    {link.label}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </div>
        ))}
        <DropdownMenuItem onClick={() => signOut()}>
          <IconLogout className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
