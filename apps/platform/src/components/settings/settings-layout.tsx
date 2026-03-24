import { cn } from "@platform/lib/utils";

type SettingsLayoutProps = {
	title: string;
	description?: string;
	children: React.ReactNode;
};

export function LayoutHead({
	title,
	description,
}: {
	title: string;
	description?: string;
}) {
	return (
		<div className="flex flex-col py-2">
			<h2 className="font-semibold">{title}</h2>
			<p className="text-muted-foreground text-sm">{description}</p>
		</div>
	);
}

export function ActionCard({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<div
			className={cn(
				"shadow-none border-b border-muted-foreground/30 py-4",
				className
			)}
		>
			{children}
		</div>
	);
}

export default function SettingsLayout({
	title,
	description,
	children,
}: SettingsLayoutProps) {
	return (
		<div className="flex flex-col w-full h-full">
			<ActionCard className="pt-0">
				<LayoutHead title={title} description={description} />
			</ActionCard>
			<div className="flex flex-col w-full h-full">{children}</div>
		</div>
	);
}
