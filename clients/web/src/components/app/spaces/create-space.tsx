"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import EmojiPicker from "@/components/emoji-picker";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import type { z } from "zod";

import { createSpaceSchema } from "@/lib/schema";
import { Textarea } from "@/components/ui/textarea";

export default function CreateSpaceDialog({
  handleSubmit,
  title,
  values,
  trigger,
  ctaText,
}: {
  handleSubmit: (values: z.infer<typeof createSpaceSchema>) => void;
  title: string;
  values: z.infer<typeof createSpaceSchema>;
  trigger: React.ReactNode;
  ctaText: string;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof createSpaceSchema>>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: values,
  });

  function handleFormSubmit(values: z.infer<typeof createSpaceSchema>) {
    handleSubmit(values);
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-8"
          >
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <FormField
                          control={form.control}
                          name="icon"
                          render={({ field }) => (
                            <EmojiPicker value={field}>
                              <Input
                                className="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 cursor-pointer border-2 border-dashed p-0 text-center"
                                placeholder="+"
                                {...field}
                              />
                            </EmojiPicker>
                          )}
                        />
                        <Input
                          placeholder="Enter a space name"
                          className="h-11 pl-12"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. These documents have notes on cars."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => form.reset()}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">{ctaText}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
