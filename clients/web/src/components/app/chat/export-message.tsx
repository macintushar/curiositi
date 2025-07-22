import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  IconFileExport,
  IconFileTypeTxt,
  IconMarkdown,
} from "@tabler/icons-react";

const exportOptions = [
  {
    label: "Markdown",
    icon: IconMarkdown,
    type: "text/markdown",
    extension: "md",
  },
  {
    label: "Text",
    icon: IconFileTypeTxt,
    type: "text/plain",
    extension: "txt",
  },
];

type ExportMessageProps = {
  message: string;
  disabled?: boolean;
  className?: string;
};

export default function ExportMessage({
  message,
  disabled = false,
  className,
}: ExportMessageProps) {
  function handleExport(format: string, extension: string) {
    const blob = new Blob([message], { type: format });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `message.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn("rounded-md", className)}
          disabled={disabled}
        >
          <IconFileExport className="size-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {exportOptions.map((option) => (
          <DropdownMenuItem
            key={option.label}
            onClick={() => handleExport(option.type, option.extension)}
            className="cursor-pointer"
          >
            <option.icon className="size-4" /> {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
