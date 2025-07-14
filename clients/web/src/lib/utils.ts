import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileTypeTxt,
  IconFileTypeCsv,
  IconFileTypeXls,
  IconFileTypePpt,
  IconFile,
  type Icon,
} from "@tabler/icons-react";

import dayjs from "dayjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types for the result object with discriminated union
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

// Main wrapper function
export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

export function formatTimestamp(timestamp: string) {
  return dayjs(timestamp).format("MM/DD/YY, H:mm A");
}

export function formatFileSize(size: string) {
  const bytes = parseInt(size, 10);
  if (isNaN(bytes)) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  // Format to 2 decimal places if there are decimals
  const formattedValue = value % 1 === 0 ? value : value.toFixed(2);
  return `${formattedValue} ${units[unitIndex]}`;
}

type FileType = {
  label: string;
  icon: Icon;
};

export function getFileType(mimeType: string): FileType {
  switch (mimeType) {
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return { label: "docx", icon: IconFileTypeDocx };
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return { label: "pptx", icon: IconFileTypePpt };
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return { label: "xlsx", icon: IconFileTypeXls };
    case "application/vnd.oasis.opendocument.text":
      return { label: "odt", icon: IconFileTypeDocx };
    case "application/vnd.oasis.opendocument.presentation":
      return { label: "odp", icon: IconFileTypePpt };
    case "application/vnd.oasis.opendocument.spreadsheet":
      return { label: "ods", icon: IconFileTypeXls };
    case "application/pdf":
      return { label: "pdf", icon: IconFileTypePdf };
    case "text/plain":
      return { label: "txt", icon: IconFileTypeTxt };
    case "text/csv":
      return { label: "csv", icon: IconFileTypeCsv };
    case "text/markdown":
      return { label: "md", icon: IconFileTypeTxt };
    default:
      return { label: "unknown", icon: IconFile };
  }
}
