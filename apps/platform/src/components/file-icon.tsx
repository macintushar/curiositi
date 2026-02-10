import type { ComponentType } from "react";
import {
	IconFile,
	IconFileText,
	IconFileTypeHtml,
	IconFileTypePdf,
	IconMarkdown,
	IconPolaroid,
	IconBrandTypescript,
	IconBrandJavascript,
} from "@tabler/icons-react";
import { FileJson2 } from "lucide-react";

type IconComponent = ComponentType<{ className?: string }>;

type FileIconRule = {
	match: string;
	icon: IconComponent;
};

const FILE_ICON_RULES: FileIconRule[] = [
	{ match: "pdf", icon: IconFileTypePdf },
	{ match: "markdown", icon: IconMarkdown },
	{ match: "html", icon: IconFileTypeHtml },
	{ match: "xml", icon: IconFileTypeHtml },
	{ match: "typescript", icon: IconBrandTypescript },
	{ match: "javascript", icon: IconBrandJavascript },
	{ match: "json", icon: FileJson2 },
	{ match: "image/", icon: IconPolaroid },
	{ match: "text/", icon: IconFileText },
	{ match: "plain", icon: IconFileText },
	{ match: "csv", icon: IconFileText },
];

type FileIconProps = {
	type: string;
	className?: string;
};

export default function FileIcon({ type, className }: FileIconProps) {
	const rule = FILE_ICON_RULES.find((r) => type.includes(r.match));
	const Icon = rule?.icon ?? IconFile;
	return <Icon className={className} />;
}
