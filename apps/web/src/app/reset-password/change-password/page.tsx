"use client";

import type { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import AuthLayout from "@/views/auth/auth-layout";
import type { changePasswordSchema } from "@/lib/schema";
import PasswordChangeForm from "@/app/app/settings/password-change-form";

export default function ChangePassword() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token || token === null || token === undefined) {
      router.push("/reset-password");
    }
  }, [token, router]);

  async function onSubmit(values: z.infer<typeof changePasswordSchema>) {
    if (!token || token === null || token === undefined) {
      router.push("/reset-password");
      return;
    }
    const { newPassword } = values;
    try {
      const { error } = await authClient.resetPassword({
        newPassword: newPassword,
        token: token,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password successfully reset");
        router.push("/sign-in");
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "An error occurred while resetting your password. Please try again.",
      );
    }
  }

  return (
    <AuthLayout description="Set a new password">
      <div className="grid gap-6">
        <PasswordChangeForm onSubmit={onSubmit} split />
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="underline underline-offset-4"
            prefetch={true}
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
