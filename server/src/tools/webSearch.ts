import { SearxngSearch } from "@langchain/community/tools/searxng_search";
import { SEARXNG_URL } from "@/constants";

export const webSearchTool = new SearxngSearch({
  apiBase: SEARXNG_URL,
  params: {
    engines: "google,duckduckgo,brave",
  },
});
