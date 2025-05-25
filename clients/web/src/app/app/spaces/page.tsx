import Link from "next/link";

import Space from "@/components/app/spaces/space";
import CreateSpaceDialog from "@/components/app/spaces/create-space";

import { getSpaces } from "@/services/spaces";

export default async function SpacesPage() {
  const { data, error } = await getSpaces();

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="h-full w-full">
      <div className="flex flex-col items-center gap-8">
        <div className="flex w-fit flex-col gap-12">
          <div className="text-primary flex w-full flex-col items-start gap-2">
            <h1 className="text-brand font-serif text-4xl">Spaces</h1>
          </div>
          <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <CreateSpaceDialog />
            {data.data.map((space, index) => (
              <Link key={index} href={`/app/spaces/${space.space.id}`}>
                <Space text={space.space.name} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
