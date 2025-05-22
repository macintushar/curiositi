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
        "bg-secondary border-primary h-full w-full rounded-lg border-[1px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
