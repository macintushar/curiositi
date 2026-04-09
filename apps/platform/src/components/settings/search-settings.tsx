import { useState } from "react";
import SettingsLayout, { ActionCard, LayoutHead } from "./settings-layout";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Separator } from "../ui/separator";
import { cn } from "@platform/lib/utils";

const searchProviders = [
	{
		id: "firecrawl",
		name: "Firecrawl",
		description: "Best for deep scraping and structured extraction",
	},
	{
		id: "exa",
		name: "Exa AI",
		description: "Neural search, finds relevant pages by semantic meaning",
	},
	{
		id: "webfetch",
		name: "WebFetch",
		description: "Lightweight direct URL fetching",
	},
] as const;

export default function SearchSettings() {
	const [selectedProvider, setSelectedProvider] = useState("firecrawl");
	const [maxResults, setMaxResults] = useState("5");
	const [includeDomains, setIncludeDomains] = useState("");
	const [excludeDomains, setExcludeDomains] = useState("");

	return (
		<SettingsLayout
			title="Search"
			description="Configure the default web search provider and its settings."
		>
			<ActionCard>
				<LayoutHead
					title="Search Provider"
					description="Select the default search provider for web searches."
				/>
				<div className="space-y-3 mt-2">
					{searchProviders.map((provider) => (
						<Button
							key={provider.id}
							type="button"
							variant="ghost"
							className={cn(
								"flex h-auto w-full items-start justify-start gap-4 p-4 rounded-lg border transition-colors text-left",
								selectedProvider === provider.id
									? "border-primary bg-primary/5"
									: "hover:bg-muted/50"
							)}
							onClick={() => setSelectedProvider(provider.id)}
						>
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<span className="font-medium">{provider.name}</span>
									{selectedProvider === provider.id && (
										<span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
											Active
										</span>
									)}
								</div>
								<p className="text-sm text-muted-foreground mt-1">
									{provider.description}
								</p>
							</div>
						</Button>
					))}
				</div>
			</ActionCard>

			<ActionCard>
				<LayoutHead
					title="Provider Settings"
					description="Configure the selected search provider."
				/>
				<div className="mt-4 space-y-4">
					<div>
						<label htmlFor="search-max-results" className="text-sm font-medium">
							Max Results
						</label>
						<Input
							id="search-max-results"
							type="number"
							value={maxResults}
							onChange={(e) => setMaxResults(e.target.value)}
							placeholder="5"
							className="mt-1"
						/>
						<p className="text-xs text-muted-foreground mt-1">
							Maximum number of search results to return.
						</p>
					</div>

					<Separator />

					<div>
						<label
							htmlFor="search-include-domains"
							className="text-sm font-medium"
						>
							Include Domains
						</label>
						<Input
							id="search-include-domains"
							value={includeDomains}
							onChange={(e) => setIncludeDomains(e.target.value)}
							placeholder="example.com, docs.example.com"
							className="mt-1"
						/>
						<p className="text-xs text-muted-foreground mt-1">
							Comma-separated list of domains to include. Leave empty for all.
						</p>
					</div>

					<div>
						<label
							htmlFor="search-exclude-domains"
							className="text-sm font-medium"
						>
							Exclude Domains
						</label>
						<Input
							id="search-exclude-domains"
							value={excludeDomains}
							onChange={(e) => setExcludeDomains(e.target.value)}
							placeholder="spam.com, ads.example.com"
							className="mt-1"
						/>
						<p className="text-xs text-muted-foreground mt-1">
							Comma-separated list of domains to exclude.
						</p>
					</div>

					<div className="pt-2">
						<Button>Save Settings</Button>
					</div>
				</div>
			</ActionCard>
		</SettingsLayout>
	);
}
