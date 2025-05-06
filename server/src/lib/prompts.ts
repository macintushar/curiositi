export const strategyPrompt = (input: string) =>
  `\nGiven the user question: "${input}", decide if you can answer it directly with very high confidence, using only your own knowledge.\n\nIf you are very sure, output:\n{\n  "strategy": "direct",\n  "answer": "Your direct answer here"\n}\n\nIf you are not sure, output:\n{\n  "strategy": "retrieve"\n}\nOutput only valid JSON.\n`;

export const queryGenPrompt = (input: string) =>
  `Given the user question: "${input}", generate up to 5 document search queries and 5 web search queries as JSON:\n{\n  "docQueries": ["..."],\n  "webQueries": ["..."]\n}\n
Guidelines:
- The documents are internal, user-uploaded, and may not contain personal, biographical, or external information (such as LinkedIn profiles, bios, company backgrounds, or news articles).
- Document queries should be simple, generic, and focused on factual or internal knowledge that is likely to be present in internal documentation (e.g., product features, internal processes, technical details, policies, etc.).
- Avoid queries that assume the presence of personal, HR, or external data in the documents.
- For web queries, you may include more specific or external information if relevant.
- If user instructs to only use the web or the internet, then only generate web queries. DO NOT generate document queries.
- If user instructs to only use the documents, then only generate document queries. DO NOT generate web queries.
- Output only valid JSON.`;

export const synthPrompt = (
  input: string,
  docResults: string[],
  webResults: string[],
) =>
  `Given these document results:
${docResults.join("\n---\n")}

And these web results:
${webResults.join("\n---\n")}

Synthesize a final answer to the original question: "${input}".

Instructions:
- Use ONLY information that is directly and clearly supported by the provided document or web results.
- If a result is not clearly relevant to the question, IGNORE it completely and do not use it in your answer.
- Do NOT speculate, make up, or infer information that is not explicitly present in the results.
- For every factual statement, clearly cite the source (e.g., 'According to doc X...', 'Based on URL Y...') DO NOT make up your own sources.
- If no relevant information is found in the results, say so honestly and do NOT attempt to answer from prior knowledge or guesswork.
`;
