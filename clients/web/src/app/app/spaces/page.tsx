import CreateSpaceDialog from "@/components/app/spaces/create-space";
import LogoLines from "@/components/app/logo-lines";

import { createSpace, getSpaces } from "@/services/spaces";
import type { createSpaceSchema } from "@/lib/schema";

import { revalidatePath } from "next/cache";
import type { z } from "zod";
import Space from "@/components/app/spaces/space";
import Link from "next/link";

export default async function SpacesPage() {
  const { data, error } = await getSpaces();

  const onSubmit = async (values: z.infer<typeof createSpaceSchema>) => {
    "use server";
    const { data, error } = await createSpace(values.name, values.icon ?? "");
    if (error) {
      console.error(error);
    }
    if (data) {
      revalidatePath("/app/spaces");
    }
  };

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="h-full max-h-full w-full overflow-auto">
      <div className="flex flex-col items-center gap-8">
        <div className="flex w-fit flex-col gap-12">
          <div className="text-primary flex w-full flex-col items-center gap-2">
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
            <CreateSpaceDialog handleSubmit={onSubmit} />
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
