"use client";

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
import { authClient, signOut } from "@/lib/auth-client";

import { IconLogout, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function Profile() {
  const { useSession } = authClient;

  const router = useRouter();
  const session = useSession();

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
    toast.success("Signed out successfully");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={session.data?.user.image ?? ""} />
          <AvatarFallback>
            {session.data?.user.name?.split(" ")[0]?.[0] ?? <IconUser />}
          </AvatarFallback>
        </Avatar>
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
                  target={link.isLinkExternal ? "_blank" : "_self"}
                  prefetch={link.isLinkExternal ? false : true}
                >
                  <DropdownMenuItem className="cursor-pointer">
                    {link.icon}
                    {link.label}
                  </DropdownMenuItem>
                </Link>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </div>
        ))}
        <DropdownMenuItem
          variant="destructive"
          className="cursor-pointer"
          onClick={handleSignOut}
        >
          <IconLogout className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
