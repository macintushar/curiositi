import type { ThreadMessage } from "@/types";

export default function Suggestions({
  suggestions,
}: {
  suggestions: ThreadMessage["followUpSuggestions"];
}) {
  return (
    <div>
      <h2>Related:</h2>
      {suggestions.map((suggestion) => (
        <div key={suggestion}>{suggestion}</div>
      ))}
    </div>
  );
}
