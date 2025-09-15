import {
  IconChevronDown,
  IconBrandOpenai,
  IconSparkles,
  IconBrain,
  IconCoinOff,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import AnthropicLogo from "@/assets/icons/anthropic-logo";
import OllamaLogo from "@/assets/icons/ollama-logo";
import OpenRouterLogo from "@/assets/icons/openrouter-logo";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import useChatStore from "@/stores/useChatStore";
import { cn } from "@/lib/utils";
import TablerIcon from "../tabler-icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ProviderIcon({
  providerName,
  className,
}: {
  providerName: string;
  className?: string;
}) {
  switch (providerName) {
    case "openai":
      return <TablerIcon Icon={IconBrandOpenai} className={className} />;
    case "anthropic":
      return <AnthropicLogo className={cn("size-4", className)} />;
    case "ollama":
      return <OllamaLogo className={cn("size-4", className)} />;
    case "openrouter":
      return <OpenRouterLogo className={cn("size-4", className)} />;
    default:
      return <TablerIcon Icon={IconSparkles} className={className} />;
  }
}

function ModelCapability({ capability }: { capability: string }) {
  switch (capability) {
    case "reasoning":
    case "thinking":
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <TablerIcon
              Icon={IconBrain}
              className="size-5 rounded-md bg-purple-800 p-0.5 text-white"
            />
          </TooltipTrigger>
          <TooltipContent>Supports reasoning capabilities</TooltipContent>
        </Tooltip>
      );
    case "free":
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger>
            <TablerIcon
              Icon={IconCoinOff}
              className="size-5 rounded-md bg-green-800 p-0.5 text-white"
            />
          </TooltipTrigger>
          <TooltipContent>
            This model uses free inference provided by the provider. Performance
            may be limited.
          </TooltipContent>
        </Tooltip>
      );

    default:
      return <></>;
  }
}

function ModelCapabilities({ capabilities }: { capabilities: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {capabilities.map((capability) => (
        <ModelCapability key={capability} capability={capability} />
      ))}
    </div>
  );
}

export default function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { configs, activeModel, setActiveModel } = useChatStore();

  useEffect(() => {
    const provider = configs?.providers.find((provider) => provider.enabled);
    if (provider && !activeModel) {
      setActiveModel({
        provider_name: provider.name,
        model: provider.models[0]!,
      });
    }
  }, [activeModel, configs, setActiveModel]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="max-w-40 sm:max-w-64"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ProviderIcon providerName={activeModel?.provider_name ?? ""} />
          <span className="truncate">{activeModel?.model.name}</span>
          <IconChevronDown
            className={cn(
              "size-4",
              isOpen && "rotate-180 transition-transform",
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 w-xs max-w-sm">
        {configs?.providers.map((provider, idx) => (
          <div key={idx}>
            <DropdownMenuLabel
              key={idx}
              className="text-muted-foreground text-xs"
            >
              {provider.title}
            </DropdownMenuLabel>
            {provider.models.map((model, idx) => (
              <DropdownMenuItem
                key={idx}
                disabled={!provider.enabled}
                className={cn(
                  "data-[active=true]:text-brand data-[active=true]:bg-brand/10 flex cursor-pointer items-center justify-between",
                  !provider.enabled && "cursor-not-allowed",
                )}
                data-active={activeModel?.model.name === model.name}
                onClick={() =>
                  setActiveModel({ provider_name: provider.name, model })
                }
              >
                <div className="flex max-w-full items-center gap-2">
                  <ProviderIcon
                    providerName={provider.name}
                    className={cn(
                      "size-5",
                      activeModel?.model.name === model.name && "text-brand",
                    )}
                  />
                  <span className="truncate">{model.name}</span>
                </div>
                <ModelCapabilities capabilities={model.capabilities} />
              </DropdownMenuItem>
            ))}
            {idx !== configs?.providers.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
