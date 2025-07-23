import { Icon } from "@/components/themes/logo/logo";
import { IconLoader } from "@tabler/icons-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="border-brand text-primary mb-4 inline-flex items-center justify-center rounded-full border p-2">
            <Icon className="text-brand size-16 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <IconLoader className="h-4 w-4 animate-spin" />
            <p className="text-muted-foreground text-sm">
              Spinning up Curiositi...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
