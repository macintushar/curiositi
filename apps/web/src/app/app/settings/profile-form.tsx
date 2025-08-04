import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { nameSchema } from "@/lib/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";

export default function ProfileForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues: {
    name: string;
    email: string;
  };
  onSubmit: (data: z.infer<typeof nameSchema>) => void;
}) {
  const form = useForm<z.infer<typeof nameSchema>>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
    },
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                placeholder="mac@curiositi"
                value={defaultValues.email}
                disabled
              />
            </FormControl>
          </FormItem>
        </div>
        <Button type="submit" className="w-fit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
