import { cn } from "@platform/lib/utils";

type MascotProps = {
	className?: string;
};

export default function Mascot({ className }: MascotProps) {
	return (
		<div className={cn("text-left", className)}>
			<p className="tracking-wide ml-0.5">/\__/\</p>
			<p className="tracking-widest transition-opacity duration-150">(^ . ^)</p>
			<p className="tracking-wider">(")_(")~</p>
		</div>
	);
}

export function MascotLogo({ className }: MascotProps) {
	return (
		<div className={cn("text-left", className)}>
			<p className="tracking-wide ml-0.5">/\__/\</p>
			<p className="tracking-widest transition-opacity duration-150">(^ . ^)</p>
		</div>
	);
}

export function MascotNotFound({ className }: MascotProps) {
	return (
		<div className={cn("text-left font-mono whitespace-pre", className)}>
			<p>{" ?       ?"}</p>
			<p>{"  /\\__/\\"}</p>
			<p>{" (o . o)  ?"}</p>
			<p>{' (")_(")'}</p>
			<p>{"     ?"}</p>
		</div>
	);
}
