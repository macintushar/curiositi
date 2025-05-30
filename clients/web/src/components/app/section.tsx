import { cn } from "@/lib/utils";

export default function Section({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-background border-sidebar-border h-full max-h-full w-full max-w-full rounded-lg border-[1px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
