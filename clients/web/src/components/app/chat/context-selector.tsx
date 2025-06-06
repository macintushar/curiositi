import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import useChatStore from "@/stores/useChatStore";
import type { AllFiles, Space } from "@/types";

import {
  IconFile,
  IconFileText,
  IconFolder,
  IconPlus,
  IconSearch,
  IconX,
  type Icon,
} from "@tabler/icons-react";

function ContextTab({
  icon,
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "cursor-pointer",
        isActive && "bg-accent border-sidebar-border",
      )}
      onClick={onClick}
    >
      {icon}
      {label}
    </Badge>
  );
}

export function ContextItem({
  label,
  roundedTop,
  roundedBottom,
  isSelected,
  Icon,
  icon,
  onAdd,
  onRemove,
}: {
  label: string;
  roundedTop?: boolean;
  roundedBottom?: boolean;
  Icon?: Icon;
  icon?: string;
  isSelected: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "border-border hover:bg-background flex max-w-full cursor-pointer items-center justify-between gap-2 border bg-white p-3",
        roundedTop && "rounded-t-xl",
        roundedBottom && "rounded-b-xl",
      )}
      onClick={isSelected ? onRemove : onAdd}
    >
      <div className="flex max-w-full items-center gap-2">
        {Icon && <Icon className="size-4" />}
        {icon && <p className="text-md">{icon}</p>}
        <p className="max-w-full text-sm">{label}</p>
      </div>
      {isSelected && <IconX className="size-4" />}
    </div>
  );
}

function ContextTabList({
  label,
  type,
  fileItems,
  spaceItems,
}: {
  label: string;
  type: "file" | "space";
  fileItems?: AllFiles[];
  spaceItems?: Space[];
}) {
  const { context, setContext } = useChatStore();
  return (
    <div className="flex w-full max-w-full flex-col">
      <p className="text-muted-foreground px-3 py-2 text-xs font-medium">
        {label}
      </p>
      {type === "file"
        ? fileItems?.map((item, idx) => (
            <ContextItem
              key={item.id}
              label={item.name}
              roundedTop={idx === 0}
              roundedBottom={idx === fileItems.length - 1}
              Icon={IconFile}
              isSelected={context.some(
                (c) => c.id === item.id && c.type === "file",
              )}
              onAdd={() => {
                setContext([
                  ...context,
                  { id: item.id, type: "file", name: item.name },
                ]);
              }}
              onRemove={() => {
                setContext(context.filter((c) => c.id !== item.id));
              }}
            />
          ))
        : spaceItems?.map((item, idx) => (
            <ContextItem
              key={item.id}
              label={item.name}
              roundedTop={idx === 0}
              roundedBottom={idx === spaceItems.length - 1}
              icon={item.icon}
              isSelected={context.some(
                (c) => c.id === item.id && c.type === "space",
              )}
              onAdd={() => {
                setContext([
                  ...context,
                  { id: item.id, type: "space", name: item.name },
                ]);
              }}
              onRemove={() => {
                setContext(context.filter((c) => c.id !== item.id));
              }}
            />
          ))}
    </div>
  );
}

export default function ContextSelector() {
  const { search, tab, files, spaces, setSearch, setTab } = useChatStore();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge variant="outline" className="flex cursor-pointer items-center">
          <IconPlus />
          Context
        </Badge>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex max-h-80 w-xs flex-col justify-between gap-2 rounded-xl"
      >
        <div className="flex flex-col gap-2">
          <div className="relative">
            <IconSearch className="text-muted-foreground absolute top-1/2 left-2 size-4 -translate-y-1/2" />
            <Input
              className="placeholder:text-muted-foreground bg-primary-foreground text-foreground h-9 pl-7 text-xs shadow-none focus-visible:ring-0"
              placeholder="Search documents or spaces"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
          </div>
          <div className="flex gap-2">
            <ContextTab
              label="All"
              isActive={tab === "all"}
              onClick={() => setTab("all")}
            />
            <ContextTab
              label="Documents"
              isActive={tab === "documents"}
              onClick={() => setTab("documents")}
              icon={<IconFileText className="size-3" />}
            />
            <ContextTab
              label="Spaces"
              isActive={tab === "spaces"}
              onClick={() => setTab("spaces")}
              icon={<IconFolder className="size-3" />}
            />
          </div>
        </div>
        <Separator />
        <ScrollArea className="h-full max-w-full overflow-y-scroll">
          {tab !== "spaces" && (
            <ContextTabList type="file" fileItems={files} label="Documents" />
          )}
          {tab !== "documents" && (
            <ContextTabList type="space" spaceItems={spaces} label="Spaces" />
          )}
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
