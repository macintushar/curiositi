import { IconFile, IconFileText, IconFileTypePdf } from "@tabler/icons-react";
import { TEXT_FILE_TYPES, PDF_TYPE } from "@curiositi/share/constants";

type FileIconProps = {
	type: string;
	className?: string;
};

export default function FileIcon({ type, className }: FileIconProps) {
	if (type === PDF_TYPE) {
		return <IconFileTypePdf className={className} />;
	}

	if (TEXT_FILE_TYPES.includes(type)) {
		return <IconFileText className={className} />;
	}

	return <IconFile className={className} />;
}
