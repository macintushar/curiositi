import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { HiddenInput } from "@/components/ui/hidden-input";

import { changePasswordSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";

export default function PasswordChangeForm({
  onSubmit,
  split = false,
}: {
  onSubmit: (data: z.infer<typeof changePasswordSchema>) => void;
  split?: boolean;
}) {
  const form = useForm<z.infer<typeof changePasswordSchema>>({
    resolver: zodResolver(changePasswordSchema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-4"
      >
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem className="col-span-1 lg:col-span-2">
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <HiddenInput {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className={cn(split && "col-span-2")}>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <HiddenInput {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem className={cn(split && "col-span-2")}>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <HiddenInput {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className={cn("w-fit", split && "w-full")}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
