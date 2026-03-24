import { Button, buttonVariants } from "../ui/button";
import { useTheme } from "./provider";
import { themes } from ".";
import { VariantProps } from "class-variance-authority";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { IconSunMoon } from "@tabler/icons-react";

export function ButtonSwitcher({
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const { theme, setTheme } = useTheme();
	const currentTheme = themes.find((t) => t.value === theme);
	if (!currentTheme) return null;
	const nextTheme = themes[(themes.indexOf(currentTheme!) + 1) % themes.length];
	return (
		<Button onClick={() => setTheme(nextTheme.value)} size="icon-lg" {...props}>
			<currentTheme.icon />
		</Button>
	);
}

export type DropdownSwitcherProps = {
	trigger?: React.ReactNode;
};

export function DropdownSwitcher({ trigger }: DropdownSwitcherProps) {
	const { theme, setTheme } = useTheme();
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{trigger ?? (
					<Button variant="ghost" size="sm">
						<IconSunMoon />
						<p className="w-full text-left">Theme</p>
					</Button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent side="right">
					{themes.map((t) => {
						return (
							<DropdownMenuCheckboxItem
								key={t.value}
								checked={theme === t.value}
								onCheckedChange={() => setTheme(t.value)}
								className="flex items-center justify-between"
							>
								{t.label}
								<code>
									<t.icon className="size-3.5" />
								</code>
							</DropdownMenuCheckboxItem>
						);
					})}
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	);
}
