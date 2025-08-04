"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { IconLoader } from "@tabler/icons-react";

import Link from "next/link";

export default function CTAButton() {
  const { data, isPending } = useSession();
  const authed = data && data.session !== null;

  return (
    <Link
      href={authed ? "/app" : "/sign-in"}
      className="cursor-pointer"
      prefetch={true}
    >
      <Button
        variant="default"
        className="cursor-pointer rounded-full"
        size="sm"
      >
        {isPending ? (
          <IconLoader className="animate-spin" />
        ) : authed ? (
          "Dashboard"
        ) : (
          "Get Started"
        )}
      </Button>
    </Link>
  );
}
