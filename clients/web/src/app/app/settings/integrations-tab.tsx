import Section from "@/components/app/section";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mcpURL } from "@/constants/app-constants";
import { IconExternalLink, IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";

export default function IntegrationsTab() {
  return (
    <div className="flex w-full flex-col gap-4">
      <Section className="h-fit space-y-6 p-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">Applications</h2>
          <p className="text-muted-foreground text-sm">
            Connect your accounts to your workspace
          </p>
        </div>
        <div className="flex items-center gap-4"></div>
      </Section>
      <Section className="h-fit space-y-6 p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium">MCP</h2>
              <Tooltip>
                <TooltipTrigger>
                  <IconInfoCircle className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  MCP provides a standardized way to connect AI models to
                  different data sources and tools.
                </TooltipContent>
              </Tooltip>
            </div>
            <Link href={mcpURL} target="_blank" rel="noopener noreferrer">
              <Button
                variant="link"
                size="sm"
                className="text-muted-foreground text-xs"
              >
                Learn More <IconExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            Use MCP to connect to other applications
          </p>
        </div>
        <div className="flex items-center gap-4"></div>
      </Section>
    </div>
  );
}
