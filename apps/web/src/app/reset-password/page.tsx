"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { emailSchema } from "@/lib/schema";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import AuthLayout from "@/views/auth/auth-layout";
import { useState } from "react";
import { env } from "@/env";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof emailSchema>) {
    const { email } = values;
    try {
      setIsLoading(true);
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${env.NEXT_PUBLIC_BASE_URL}/reset-password/change-password`,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset email sent");
      }
    } catch (error) {
      console.error(error);

      toast.error(
        "An error occurred while resetting your password. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout description="Forgot your password?">
      <Form {...form}>
        <form
          className="flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="grid gap-6">
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`mac@email.com`}
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              loadingText="Sending reset email..."
            >
              Request reset email
            </Button>
          </div>
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
        </form>
      </Form>
    </AuthLayout>
  );
}
