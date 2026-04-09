type Model = {
	id: string;
	name: string;
	tool_call: boolean;
	reasoning: boolean;
	attachment: boolean;
	open_weights: boolean;
};

type SupportedProviders = "openai" | "ollama-cloud" | "anthropic" | "google";

type Provider = {
	id: string;
	env: string[];
	name: string;
	doc: string;
	models: Record<string, Model[]>;
};

type ModelsDevRes = Record<string, Model>;

const json = (await fetch("https://models.dev/api.json")
	.then((res) => res.json())
	.catch((err) => console.error(err))) as unknown as ModelsDevRes;

const PROVIDERS: SupportedProviders[] = [
	"openai",
	"ollama-cloud",
	"anthropic",
	"google",
];

const supportedProviders = Object.keys(json)
	.filter((providerId) => PROVIDERS.includes(providerId as SupportedProviders))
	.map(
		(providerId) => json[providerId as SupportedProviders]
	) as unknown as Provider[];

const supportedModelsFromProviders = supportedProviders.map((provider) => {
	return {
		providerId: provider.id,
		models: Object.entries(provider.models).flatMap(([_, models]) => models),
	};
});

console.log(supportedModelsFromProviders);
