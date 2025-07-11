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
import { HiddenInput } from "@/components/ui/hidden-input";

import { signInSchema } from "@/lib/schema";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import AuthLayout from "@/views/auth/auth-layout";

export default function SignIn() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signInSchema>) {
    const { email, password } = values;
    try {
      const response = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      });

      if (response.data?.user) {
        toast.success("Signed in successfully");
        router.push("/app");
      } else {
        toast.error(response.error?.message ?? "Failed to sign in");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while signing in. Please try again.");
    }
  }
  return (
    <AuthLayout description="Sign in to access curiositi">
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
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <HiddenInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </div>
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="underline underline-offset-4"
              prefetch={true}
            >
              Sign up
            </Link>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}
