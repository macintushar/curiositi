"use client";

import CreateSpaceDialog from "@/components/app/spaces/create-space";
import LogoLines from "@/components/app/logo-lines";

import { useSpaces, useCreateSpace } from "@/hooks/use-spaces";
import type { createSpaceSchema } from "@/lib/schema";

import type { z } from "zod";
import Space from "@/components/app/spaces/space";
import Link from "next/link";
import GlobalError from "@/app/global-error";
import { toast } from "sonner";

export default function SpacesPage() {
  const { data, error, isLoading } = useSpaces();
  const createSpaceMutation = useCreateSpace();

  const onSubmit = async (values: z.infer<typeof createSpaceSchema>) => {
    createSpaceMutation.mutate(
      {
        name: values.name,
        icon: values.icon ?? "",
        description: values.description ?? "",
      },
      {
        onSuccess: (data) => {
          if (data?.data?.[0]?.id) {
            toast.success(`Created space ${data.data[0].name}`);
            return {
              success: true,
              message: `Created space ${data.data[0].name}`,
            };
          }
          return { success: false, error: "Unknown error occurred" };
        },
        onError: (error) => {
          console.error(error);
          toast.error(error.message || "Failed to create space");
          return { success: false, error: error };
        },
      },
    );
    if (createSpaceMutation.isSuccess) {
      return { success: true, message: "Space created successfully" };
    } else {
      return { success: false, error: "Failed to create space" };
    }
  };

  if (error) {
    return <GlobalError error={error} />;
  }

  if (isLoading) {
    return (
      <div className="h-full max-h-full w-full overflow-auto">
        <div className="flex flex-col items-center gap-8">
          <div className="flex w-fit flex-col">
            <div className="text-primary flex w-full flex-col items-center">
              <LogoLines description="">
                <h1 className="w-sm text-center font-serif text-4xl">
                  <span className="text-brand">
                    An extension of your <span className="italic">mind</span>,
                  </span>{" "}
                  <br />
                  <span className="text-brand/40">
                    to chat with your <span className="italic">knowledge</span>.
                  </span>
                </h1>
              </LogoLines>
            </div>
            <div className="mx-auto grid h-full grid-cols-1 gap-16 overflow-auto pt-7 sm:grid-cols-2 md:grid-cols-3">
              <div className="text-muted-foreground text-center">
                Loading spaces...
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-h-full w-full overflow-auto">
      <div className="flex flex-col items-center gap-8">
        <div className="flex w-fit flex-col">
          <div className="text-primary flex w-full flex-col items-center">
            <LogoLines description="">
              <h1 className="w-sm text-center font-serif text-4xl">
                <span className="text-brand">
                  An extension of your <span className="italic">mind</span>,
                </span>{" "}
                <br />
                <span className="text-brand/40">
                  to chat with your <span className="italic">knowledge</span>.
                </span>
              </h1>
            </LogoLines>
          </div>
          <div className="mx-auto grid h-full grid-cols-1 gap-16 overflow-auto pt-7 sm:grid-cols-2 md:grid-cols-3">
            <CreateSpaceDialog
              handleSubmit={onSubmit}
              title="Create new space"
              values={{ name: "", icon: "", description: "" }}
              trigger={<Space text="Create new space" isEmpty />}
              ctaText={createSpaceMutation.isPending ? "Creating..." : "Create"}
              isLoading={createSpaceMutation.isPending}
            />
            {data?.data?.map((space, index) => (
              <Link href={`/app/spaces/${space.space.id}`} key={index} prefetch>
                <Space
                  key={index}
                  text={space.space.name}
                  icon={space.space.icon}
                  fileCount={space.files}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
