import useChatStore from "@/stores/useChatStore";
import type { ThreadMessage } from "@/types";
import { IconPlus } from "@tabler/icons-react";

export default function Suggestions({
  suggestions,
}: {
  suggestions: ThreadMessage["followUpSuggestions"];
}) {
  const { setPrompt } = useChatStore();
  return (
    <div className="flex flex-col gap-2 py-4">
      <h2 className="text-brand font-serif text-2xl italic">Related:</h2>
      {suggestions.map((suggestion) => (
        <div
          className="hover:text-brand flex cursor-pointer items-center justify-between border-t-[1px] p-2 transition-colors"
          onClick={() => setPrompt(suggestion)}
          key={suggestion}
        >
          <span>{suggestion}</span>
          <IconPlus className="text-brand size-4" />
        </div>
      ))}
    </div>
  );
}
