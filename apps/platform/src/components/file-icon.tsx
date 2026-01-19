import { IconFile, IconFileTypePdf } from "@tabler/icons-react";
import { TEXT_FILE_TYPES, PDF_TYPE } from "@curiositi/share/constants";

type FileIconProps = {
	type: string;
	className?: string;
};

export default function FileIcon({ type, className }: FileIconProps) {
	if (!TEXT_FILE_TYPES.includes(type) && type !== PDF_TYPE) {
		return <IconFile className={className} />;
	}

	switch (type) {
		case "text/plain":
			return <IconFileTypePdf className={className} />;
		default:
			return <IconFileTypePdf className={className} />;
	}
}
