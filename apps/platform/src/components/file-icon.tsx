import {
	IconFile,
	IconFileText,
	IconFileTypeHtml,
	IconFileTypePdf,
	IconMarkdown,
	IconPolaroid,
} from "@tabler/icons-react";
import {
	TEXT_FILE_TYPES,
	PDF_TYPE,
	IMAGE_TYPES,
} from "@curiositi/share/constants";

type FileIconProps = {
	type: string;
	className?: string;
};

export default function FileIcon({ type, className }: FileIconProps) {
	if (type === PDF_TYPE) {
		return <IconFileTypePdf className={className} />;
	}

	if (TEXT_FILE_TYPES.includes(type)) {
		if (type.includes("markdown")) {
			return <IconMarkdown className={className} />;
		}
		if (type.includes("html") || type.includes("xml")) {
			return <IconFileTypeHtml className={className} />;
		}
		return <IconFileText className={className} />;
	}

	if (IMAGE_TYPES.includes(type)) {
		return <IconPolaroid className={className} />;
	}

	return <IconFile className={className} />;
}
