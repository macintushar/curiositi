import * as React from "react";
import { useState, useRef } from "react";
import { Badge } from "@platform/components/ui/badge";
import { cn } from "@platform/lib/utils";
import { IconX } from "@tabler/icons-react";

interface TagInputProps {
	value: string[];
	onChange: (tags: string[]) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

export function TagInput({
	value,
	onChange,
	placeholder = "Add tag...",
	disabled = false,
	className,
}: TagInputProps) {
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const addTag = (tag: string) => {
		const trimmedTag = tag.trim();
		if (trimmedTag && !value.includes(trimmedTag)) {
			onChange([...value, trimmedTag]);
		}
		setInputValue("");
	};

	const removeTag = (tagToRemove: string) => {
		onChange(value.filter((tag) => tag !== tagToRemove));
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" || e.key === ",") {
			e.preventDefault();
			addTag(inputValue);
		} else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
			removeTag(value[value.length - 1] as string);
		}
	};

	const handleContainerClick = () => {
		inputRef.current?.focus();
	};

	return (
		<div
			onClick={handleContainerClick}
			className={cn(
				"flex flex-wrap gap-1.5 p-2 border rounded-md bg-background min-h-[38px] cursor-text",
				disabled && "opacity-50 cursor-not-allowed",
				className
			)}
		>
			{value.map((tag) => (
				<Badge
					key={tag}
					variant="secondary"
					className="gap-1 pr-1 text-xs font-normal"
				>
					{tag}
					{!disabled && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								removeTag(tag);
							}}
							className="rounded-full hover:bg-muted-foreground/20 p-0.5"
						>
							<IconX className="w-3 h-3" />
						</button>
					)}
				</Badge>
			))}
			{!disabled && (
				<input
					ref={inputRef}
					type="text"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={() => {
						if (inputValue.trim()) {
							addTag(inputValue);
						}
					}}
					placeholder={value.length === 0 ? placeholder : ""}
					className="flex-1 min-w-[80px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
					disabled={disabled}
				/>
			)}
		</div>
	);
}
