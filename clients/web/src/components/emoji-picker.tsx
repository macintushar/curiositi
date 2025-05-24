"use client";

import { emojiList } from "@/constants/emoji-list";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";
import { Button } from "./ui/button";

export default function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [emojis, setEmojis] = useState(emojiList);

  const filterEmojis = (search: string) => {
    setSearch(search);
    setEmojis(
      emojiList.filter((emoji) =>
        emoji.name.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="flex cursor-pointer items-center justify-center"
        >
          <p
            className={`text-sm ${selectedEmoji ? "text-primary" : "text-primary/30"}`}
          >
            {selectedEmoji ?? "🙂"}
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex h-64 flex-col gap-2 overflow-y-auto">
        <Input
          className="placeholder:text-primary/50 h-6 text-xs shadow-none focus-visible:ring-0"
          placeholder="Search for an emoji"
          value={search}
          onChange={(e) => filterEmojis(e.target.value)}
        />
        <div className="grid w-full grid-cols-8 gap-2">
          {emojis.map((emoji, index) => (
            <div
              key={index}
              className="cursor-pointer"
              onClick={() => setSelectedEmoji(emoji.emoji)}
            >
              {emoji.emoji}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
