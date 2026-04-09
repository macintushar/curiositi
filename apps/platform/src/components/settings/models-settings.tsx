import { useState } from "react";
import SettingsLayout, { ActionCard, LayoutHead } from "./settings-layout";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
	getProviders,
	getModelsForProvider,
	SUPPORTED_PROVIDERS,
} from "@curiositi/share/models";
import ProviderLogo from "../chat/provider-logo";
import { Star, StarOff } from "lucide-react";
import { cn } from "@platform/lib/utils";

export default function ModelsSettings() {
	const providers = getProviders();
	const [enabledModels, setEnabledModels] = useState<Set<string>>(
		new Set(
			SUPPORTED_PROVIDERS.flatMap((p) =>
				getModelsForProvider(p).map((m) => m.id)
			)
		)
	);
	const [defaultModel, setDefaultModel] =
		useState<string>("openai/gpt-4o-mini");
	const [activeProvider, setActiveProvider] =
		useState<(typeof SUPPORTED_PROVIDERS)[number]>("openai");

	const toggleModel = (modelId: string) => {
		setEnabledModels((prev) => {
			const next = new Set(prev);
			if (next.has(modelId)) {
				next.delete(modelId);
			} else {
				next.add(modelId);
			}
			return next;
		});
	};

	const allModels = providers
		.filter((p) =>
			SUPPORTED_PROVIDERS.includes(p.id as (typeof SUPPORTED_PROVIDERS)[number])
		)
		.flatMap((provider) =>
			getModelsForProvider(provider.id).map((model) => ({
				model,
				provider,
			}))
		);

	const filteredModels = allModels.filter(
		({ provider }) => provider.id === activeProvider
	);

	return (
		<SettingsLayout
			title="Models"
			description="Enable or disable models for your organization."
		>
			<ActionCard>
				<LayoutHead
					title="Default Model"
					description="The model used when no model is explicitly selected."
				/>
				<div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 mt-2">
					<ProviderLogo
						providerId={
							(defaultModel.split("/")[0] ?? "openai") as
								| "openai"
								| "google"
								| "anthropic"
								| "ollama"
						}
					/>
					<span className="font-medium">
						{defaultModel.split("/")[1] ?? defaultModel}
					</span>
					<Badge variant="secondary">Default</Badge>
				</div>
			</ActionCard>

			<ActionCard>
				<LayoutHead
					title="Available Models"
					description="Toggle models on or off."
				/>
				<div className="flex gap-2 mb-4 mt-2">
					{SUPPORTED_PROVIDERS.map((providerId) => (
						<Button
							key={providerId}
							variant={activeProvider === providerId ? "default" : "outline"}
							size="sm"
							onClick={() => setActiveProvider(providerId)}
							className="gap-2"
						>
							<ProviderLogo providerId={providerId} className="w-4 h-4" />
							{providerId.charAt(0).toUpperCase() + providerId.slice(1)}
						</Button>
					))}
				</div>

				<Separator className="mb-4" />

				<div className="space-y-2">
					{filteredModels.map(({ model, provider }) => {
						const isEnabled = enabledModels.has(model.id);
						const isDefault = model.id === defaultModel;

						return (
							<div
								key={model.id}
								className={cn(
									"flex items-center justify-between p-3 rounded-lg border transition-colors",
									!isEnabled && "opacity-50"
								)}
							>
								<div className="flex items-center gap-3">
									<ProviderLogo providerId={provider.id} />
									<div>
										<div className="flex items-center gap-2">
											<span className="font-medium text-sm">{model.name}</span>
											{isDefault && (
												<Badge variant="secondary" className="text-xs">
													Default
												</Badge>
											)}
										</div>
										<span className="text-xs text-muted-foreground">
											{model.id}
										</span>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8"
										onClick={() => {
											if (isEnabled) setDefaultModel(model.id);
										}}
										disabled={!isEnabled}
									>
										{isDefault ? (
											<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
										) : (
											<StarOff className="w-4 h-4" />
										)}
									</Button>
									<Switch
										checked={isEnabled}
										onCheckedChange={() => toggleModel(model.id)}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</ActionCard>
		</SettingsLayout>
	);
}
