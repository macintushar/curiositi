import {
  IconCheck,
  IconChevronDown,
  IconBrandOpenai,
  IconSparkles,
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

function ProviderIcon({ providerName }: { providerName: string }) {
  switch (providerName) {
    case "openai":
      return <IconBrandOpenai className="size-4" />;
    case "anthropic":
      return <AnthropicLogo className="size-4" />;
    case "ollama":
      return <OllamaLogo className="size-4" />;
    case "openrouter":
      return <OpenRouterLogo className="size-4" />;
    default:
      return <IconSparkles className="size-4" />;
  }
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
      <DropdownMenuContent align="start" className="max-h-80 max-w-sm">
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
                  "flex cursor-pointer items-center justify-between",
                  !provider.enabled && "cursor-not-allowed",
                )}
                onClick={() =>
                  setActiveModel({ provider_name: provider.name, model })
                }
              >
                <div className="flex max-w-full items-center gap-2">
                  <ProviderIcon providerName={provider.name} />
                  <span className="truncate">{model.name}</span>
                </div>
                {activeModel?.model.name === model.name && (
                  <IconCheck className="size-4" />
                )}
              </DropdownMenuItem>
            ))}
            {idx !== configs?.providers.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
