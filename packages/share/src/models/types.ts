import type { SUPPORTED_PROVIDERS } from ".";

export type Modality = "text" | "image" | "audio" | "video" | "pdf";

export type ModelCost = {
	input: number;
	output: number;
	reasoning?: number;
	cache_read?: number;
	cache_write?: number;
	input_audio?: number;
	output_audio?: number;
};

export type ModelLimits = {
	context: number;
	input: number;
	output: number;
};

export type Model = {
	id: string;
	name: string;
	family?: string;
	attachment: boolean;
	reasoning: boolean;
	tool_call: boolean;
	structured_output?: boolean;
	temperature?: boolean;
	knowledge?: string;
	release_date: string;
	last_updated: string;
	open_weights: boolean;
	modalities: {
		input: Modality[];
		output: Modality[];
	};
	cost: ModelCost;
	limit: ModelLimits;
	status?: "alpha" | "beta" | "deprecated";
};

export type Provider = {
	id: SupportedProvider;
	name: string;
	npm: string;
	env: string[];
	doc: string;
	api?: string;
	models: Record<string, Model>;
};

export type ModelsDevData = Record<string, Provider>;

export type ModelSelectorProps = {
	id: string;
	name: string;
	provider: string;
	costPerMillion: number;
	contextWindow: number;
	supportsTools: boolean;
	supportsVision: boolean;
	supportsAttachments: boolean;
};

export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];
export type AIProvider = SupportedProvider;
