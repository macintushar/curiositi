import { useState, useEffect } from "react";
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
import { trpcClient } from "@platform/integrations/tanstack-query/root-provider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function ModelsSettings() {
	const queryClient = useQueryClient();
	const providers = getProviders();

	const allSupportedModels = SUPPORTED_PROVIDERS.flatMap((p) =>
		getModelsForProvider(p).map((m) => m.id)
	);

	const [enabledModels, setEnabledModels] = useState<Set<string>>(
		new Set(allSupportedModels)
	);
	const [defaultModel, setDefaultModel] =
		useState<string>("openai/gpt-4o-mini");
	const [activeProvider, setActiveProvider] =
		useState<(typeof SUPPORTED_PROVIDERS)[number]>("openai");

	const { data: savedSettings } = useQuery({
		queryKey: ["settings", "models"],
		queryFn: () => trpcClient.settings.getModels.query(),
	});

	useEffect(() => {
		if (savedSettings) {
			setEnabledModels(new Set(savedSettings.enabledModels));
			setDefaultModel(savedSettings.defaultModel);
		}
	}, [savedSettings]);

	const saveSettings = useMutation({
		mutationFn: (input: { enabledModels: string[]; defaultModel: string }) =>
			trpcClient.settings.setModels.mutate(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["settings", "models"] });
			toast.success("Model settings saved");
		},
		onError: () => {
			toast.error("Failed to save model settings");
		},
	});

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

	const handleSave = () => {
		saveSettings.mutate({
			enabledModels: Array.from(enabledModels),
			defaultModel,
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

				<div className="pt-4">
					<Button onClick={handleSave} disabled={saveSettings.isPending}>
						Save Settings
					</Button>
				</div>
			</ActionCard>
		</SettingsLayout>
	);
}
