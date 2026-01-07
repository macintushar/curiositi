import { cn } from "@platform/lib/utils";

export default function ContentBox({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"gap-2 p-4 rounded-2xl border-border border bg-background",
				className
			)}
		>
			{children}
		</div>
	);
}
