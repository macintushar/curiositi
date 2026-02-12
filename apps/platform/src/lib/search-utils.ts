export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: Date | string): string {
	const d = typeof date === "string" ? new Date(date) : date;
	const now = new Date();
	const diffMs = now.getTime() - d.getTime();
	const diffSecs = Math.floor(diffMs / 1000);
	const diffMins = Math.floor(diffSecs / 60);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffDays === 0) {
		if (diffHours === 0) {
			if (diffMins === 0) {
				return "Just now";
			}
			return `${diffMins}m ago`;
		}
		return `${diffHours}h ago`;
	}
	if (diffDays === 1) {
		return "Yesterday";
	}
	if (diffDays < 7) {
		const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		return days[d.getDay()];
	}

	const months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	const month = months[d.getMonth()];
	const day = d.getDate();
	const year = d.getFullYear();
	const currentYear = now.getFullYear();

	if (year === currentYear) {
		return `${month} ${day}`;
	}
	return `${month} ${day}, ${year}`;
}

export function highlightMatches(text: string, query: string): string {
	if (!query) return text;
	const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
	return text.replace(regex, "**$1**");
}

function escapeRegExp(string: string): string {
	return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getFileTypeLabel(mimeType: string): string {
	if (mimeType.startsWith("image/")) return "Image";
	if (mimeType === "application/pdf") return "PDF";
	if (mimeType.startsWith("text/")) return "Text";
	if (mimeType.includes("json")) return "JSON";
	if (mimeType.includes("xml")) return "XML";
	return "File";
}

export function getFileTypeColor(mimeType: string): string {
	if (mimeType.startsWith("image/")) return "text-blue-500";
	if (mimeType === "application/pdf") return "text-red-500";
	if (mimeType.startsWith("text/")) return "text-gray-500";
	if (mimeType.includes("json") || mimeType.includes("xml"))
		return "text-green-500";
	return "text-gray-400";
}
