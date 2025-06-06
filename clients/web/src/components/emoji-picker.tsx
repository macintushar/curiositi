"use client";

import type { ControllerRenderProps } from "react-hook-form";
import { IconTrashX } from "@tabler/icons-react";
import { useState } from "react";

import { emojiList, type Emoji } from "@/constants/emoji-list";

import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function EmojiPicker({
  children,
  value,
}: {
  children: React.ReactNode;
  value: ControllerRenderProps<
    { name: string; icon?: string | undefined },
    "icon"
  >;
}) {
  const [search, setSearch] = useState("");

  const [hoveredEmoji, setHoveredEmoji] = useState<Emoji | null>(null);
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
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="flex flex-col justify-between gap-4 rounded-xl p-4">
        <div className="flex h-fit items-center justify-between">
          <h1 className="text-primary text-sm font-medium">Emoji</h1>
          <IconTrashX
            className={
              `h-5 w-5 ` +
              (value.value
                ? "text-brand cursor-pointer"
                : "text-brand/40 cursor-not-allowed")
            }
            onClick={() => value.onChange("")}
          />
        </div>
        <Input
          className="placeholder:text-primary/50 h-8 text-xs shadow-none focus-visible:ring-0"
          placeholder="Search emoji"
          value={search}
          onChange={(e) => filterEmojis(e.target.value)}
        />
        <div className="grid h-48 w-full grid-cols-7 gap-2 overflow-x-clip overflow-y-scroll p-2">
          {emojis.map((emoji, index) => (
            <div
              key={index}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md p-2 text-2xl hover:bg-gray-200"
              onClick={() => value.onChange(emoji.emoji)}
              onMouseEnter={() => setHoveredEmoji(emoji)}
              onMouseLeave={() => setHoveredEmoji(null)}
            >
              {emoji.emoji}
            </div>
          ))}
        </div>
        <div className="flex h-8 justify-start">
          <div className="flex items-center gap-2">
            <p className="text-2xl transition-all duration-700">
              {hoveredEmoji ? hoveredEmoji.emoji : (value.value ?? null)}
            </p>
            <p className="text-primary/50 text-sm">
              {hoveredEmoji
                ? hoveredEmoji.name
                : (emojiList.find((emoji) => emoji.emoji === value.value)
                    ?.name ?? "Not selected")}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
