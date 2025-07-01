"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { authClient } from "@/lib/auth-client";
import { IconUser } from "@tabler/icons-react";
import ProfileForm from "./profile-form";
import Section from "@/components/app/section";
import type { nameSchema } from "@/lib/schema";
import type { z } from "zod";
import { toast } from "sonner";
import PasswordChangeForm from "./password-change-form";

export default function SettingsPage() {
  const { useSession, updateUser } = authClient;

  const session = useSession();

  async function handleUserInfoChange(data: z.infer<typeof nameSchema>) {
    try {
      const response = await updateUser({
        name: data.name,
      });

      if (response.error) {
        toast.error(response.error.message);
      } else {
        toast.success("User information updated successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating your information");
    }
  }

  console.log(session.data?.user);
  return (
    <div className="flex h-full flex-col items-center justify-start overflow-y-auto p-4">
      <div className="flex h-full w-full flex-col gap-4 lg:w-2/3">
        <div className="flex items-center justify-between">
          <h1 className="text-brand font-serif text-4xl font-medium">
            Settings
          </h1>
        </div>
        <Section className="h-fit space-y-6 p-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">Profile Information</h2>
            <p className="text-muted-foreground text-sm">
              Update your personal information
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.data?.user.image ?? ""} />
              <AvatarFallback className="text-2xl">
                {session.data?.user.name?.split(" ")[0]?.[0] ?? <IconUser />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-fit" disabled>
                Change Avatar
              </Button>
              <p className="text-muted-foreground text-sm">
                We support PNG, JPG, and WEBP files up to 2MB
              </p>
            </div>
          </div>
          {session.data?.user.name && session.data?.user.email ? (
            <ProfileForm
              defaultValues={{
                name: session.data?.user.name,
                email: session.data?.user.email ?? "",
              }}
              onSubmit={handleUserInfoChange}
            />
          ) : (
            <div>Loading...</div>
          )}
        </Section>
        <Section className="h-fit space-y-6 p-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-medium">Password</h2>
            <p className="text-muted-foreground text-sm">
              Update your password
            </p>
          </div>
          {session.data?.user.name && session.data?.user.email ? (
            <PasswordChangeForm
              onSubmit={() => {
                toast.success("Password updated successfully");
              }}
            />
          ) : (
            <div>Loading...</div>
          )}
        </Section>
      </div>
    </div>
  );
}
