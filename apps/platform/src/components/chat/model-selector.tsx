"use client";

import { useState, useMemo } from "react";
import { cn } from "@platform/lib/utils";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useChatStore } from "@platform/stores/chat-store";
import {
	getProviders,
	getModelsForProvider,
	modelSupportsTools,
	modelSupportsVision,
	modelSupportsAttachments,
	SUPPORTED_PROVIDERS,
	type Model,
	type Provider,
} from "@curiositi/share/models";
import {
	IconSparkles,
	IconPaperclip,
	IconChevronDown,
	IconSearch,
	IconEye,
	IconInfoCircle,
	IconStar,
	IconStarFilled,
	IconLoader2,
	IconChevronUp,
} from "@tabler/icons-react";
import ProviderLogo from "./provider-logo";
import { Input } from "../ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Separator } from "../ui/separator";

type CostTier = "$" | "$$" | "$$$" | "$$$+";

function getCostTier(model: Model): CostTier {
	const totalCost = model.cost.input + model.cost.output;
	if (totalCost < 1) return "$";
	if (totalCost < 3) return "$$";
	if (totalCost < 8) return "$$$";
	return "$$$+";
}

const COST_TIERS: Record<CostTier, { color: string; text: string }> = {
	$: { color: "text-green-400", text: "Low cost" },
	$$: { color: "text-green-400", text: "Moderate cost" },
	$$$: { color: "text-green-400", text: "High cost" },
	"$$$+": { color: "text-red-400", text: "Very high cost" },
};

type ModelListItemProps = {
	model: Model;
	provider: Provider;
	isSelected: boolean;
	isFavorite: boolean;
	onClick: (e: React.MouseEvent) => void;
	onToggleFavorite: (e: React.MouseEvent) => void;
};

function ModelListItem({
	model,
	isSelected,
	onClick,
	provider,
}: ModelListItemProps) {
	const costTier = getCostTier(model);

	return (
		<div
			onClick={onClick}
			className={cn(
				"group w-full text-left p-3 rounded-xl transition-all duration-200 cursor-pointer",
				isSelected && "bg-muted"
			)}
		>
			<div className="flex items-center gap-3">
				<ProviderLogo providerId={provider.id} />

				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2">
						<span className="font-semibold text-sm truncate">{model.name}</span>
						<Tooltip>
							<TooltipTrigger>
								<span
									className={cn(
										"text-xs text-zinc-500 font-medium",
										COST_TIERS[costTier].color
									)}
								>
									{costTier}
								</span>
							</TooltipTrigger>
							<TooltipContent>{COST_TIERS[costTier].text}</TooltipContent>
						</Tooltip>
					</div>
				</div>

				<div className="flex items-center gap-1 shrink-0">
					{modelSupportsVision(model) && (
						<Button size="icon-sm" variant="outline">
							<IconEye />
						</Button>
					)}
					{modelSupportsTools(model) && (
						<Button size="icon-sm" variant="outline">
							<IconSparkles />
						</Button>
					)}
					{modelSupportsAttachments(model) && (
						<Button size="icon-sm" variant="outline">
							<IconPaperclip />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

export default function ModelSelector() {
	const { selectedModelId, selectedModelProvider, setSelectedModel } =
		useChatStore();
	const [open, setOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [favorites, setFavorites] = useState<Set<string>>(new Set());
	const [activeProvider, setActiveProvider] = useState<string>(
		selectedModelProvider || "openai"
	);

	const providers = getProviders();

	const allModels = useMemo(() => {
		const models: Array<{ model: Model; provider: Provider }> = [];
		for (const providerId of SUPPORTED_PROVIDERS) {
			const provider = providers.find((p) => p.id === providerId);
			if (!provider) continue;
			const providerModels = getModelsForProvider(providerId);
			for (const model of providerModels) {
				models.push({ model, provider });
			}
		}
		return models;
	}, [providers]);

	const filteredModels = useMemo(() => {
		let models = allModels;

		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			models = allModels.filter(
				({ model }) =>
					model.name.toLowerCase().includes(query) ||
					model.id.toLowerCase().includes(query)
			);
		}

		return models.filter(({ provider }) => provider.id === activeProvider);
	}, [allModels, searchQuery, activeProvider]);

	const currentModel = useMemo(() => {
		if (!selectedModelId) return null;
		return allModels.find(({ model }) => model.id === selectedModelId);
	}, [allModels, selectedModelId]);

	const toggleFavorite = (e: React.MouseEvent, modelId: string) => {
		e.stopPropagation();
		setFavorites((prev) => {
			const next = new Set(prev);
			if (next.has(modelId)) {
				next.delete(modelId);
			} else {
				next.add(modelId);
			}
			return next;
		});
	};

	const handleModelSelect = (
		e: React.MouseEvent,
		model: Model,
		provider: Provider
	) => {
		e.stopPropagation();
		setSelectedModel(model.id, provider.id);
		setOpen(false);
	};

	const handleProviderClick = (e: React.MouseEvent, providerId: string) => {
		e.stopPropagation();
		setActiveProvider(providerId);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="gap-2 h-9 px-3 font-normal border-0"
				>
					{currentModel ? (
						<>
							<ProviderLogo providerId={currentModel.provider.id} />
							<span className="text-sm">{currentModel.model.name}</span>
							<span
								className={cn(
									"text-xs",
									COST_TIERS[getCostTier(currentModel.model)].color
								)}
							>
								{getCostTier(currentModel.model)}
							</span>
						</>
					) : (
						<span className="text-sm">Select model</span>
					)}
					{open ? (
						<IconChevronUp className="w-4 h-4 ml-1" />
					) : (
						<IconChevronDown className="w-4 h-4 ml-1" />
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent
				className="p-0 w-full max-w-lg max-h-80 h-full"
				align="end"
				alignOffset={-24}
				sideOffset={8}
			>
				<div className="p-3 h-16">
					<div className="relative">
						<IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
						<Input
							placeholder="Search models..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							className="pl-9 pr-9 h-9 text-sm"
						/>
					</div>
				</div>

				<div className="flex max-h-64 max-w-lg w-lg h-64">
					<div className="w-14 border-r border-t rounded-tr-xl p-2 flex flex-col gap-2">
						{SUPPORTED_PROVIDERS.map((providerId) => {
							const provider = providers.find((p) => p.id === providerId);
							if (!provider) return null;

							return (
								<Button
									key={providerId}
									type="button"
									onClick={(e) => handleProviderClick(e, providerId)}
									variant={
										activeProvider === providerId ? "activeGhost" : "ghost"
									}
									className={cn(
										"w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
									)}
								>
									<ProviderLogo providerId={providerId} className="w-5 h-5" />
								</Button>
							);
						})}
					</div>

					<div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-60">
						{filteredModels.length === 0 ? (
							<div className="py-8 text-center">
								<IconLoader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
								<p className="text-sm">No models found</p>
								<p className="text-xs mt-1">
									Add API keys to enable more models
								</p>
							</div>
						) : (
							filteredModels.map(({ model, provider }) => (
								<ModelListItem
									key={`${provider.id}-${model.id}`}
									model={model}
									provider={provider}
									isSelected={
										selectedModelId === model.id &&
										selectedModelProvider === provider.id
									}
									isFavorite={favorites.has(model.id)}
									onClick={(e) => handleModelSelect(e, model, provider)}
									onToggleFavorite={(e) => toggleFavorite(e, model.id)}
								/>
							))
						)}
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
