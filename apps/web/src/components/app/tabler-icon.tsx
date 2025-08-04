import { cn } from "@/lib/utils";
import type { Icon } from "@tabler/icons-react";

type IconProps = {
  Icon: Icon;
  className?: string;
};

export default function TablerIcon({ Icon, className }: IconProps) {
  return <Icon className={cn("size-4", className)} />;
}
