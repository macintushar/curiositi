"use client";

import * as React from "react";
import { Folder, Home, Link2, Settings } from "lucide-react";

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@platform/components/ui/command";
import { useNavigate } from "@tanstack/react-router";

export default function Commander() {
	const [open, setOpen] = React.useState(false);

	const navigate = useNavigate();

	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	return (
		<>
			<p className="text-muted-foreground text-sm">
				Press{" "}
				<kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
					<span className="text-xs">⌘&apos;</span>J
				</kbd>
			</p>
			<CommandDialog open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Looking for something..." />
				<CommandList>
					<CommandEmpty>No results found.</CommandEmpty>
					<CommandGroup heading="QUICK ACTIONS">
						<CommandItem>
							<Link2 />
							<span>Add a link</span>
						</CommandItem>
						<CommandItem>
							<Folder />
							<span>Create a Space</span>
						</CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="NAVIGATION">
						<CommandItem
							onSelect={() => {
								navigate({ to: "/app" });
								setOpen(false);
							}}
						>
							<Home />
							<span>Home</span>
							<CommandShortcut>⌘H</CommandShortcut>
						</CommandItem>
						<CommandItem
							onSelect={() => {
								navigate({ to: "/app/settings" });
								setOpen(false);
							}}
						>
							<Settings />
							<span>Settings</span>
							<CommandShortcut>⌘S</CommandShortcut>
						</CommandItem>
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	);
}
