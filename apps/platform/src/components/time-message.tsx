import { cn, getTime } from "@platform/lib/utils";

const messages = {
	lateNight: "🌕 Up late",
	morning: "🌅 Good morning",
	afternoon: "☀️ Good afternoon",
	evening: "🌇 Good evening",
};

function getTimeMessage(time: string[]) {
	const [hm, ampm] = time;
	const hour = Number(hm.split(":")[0]);
	if (hour < 7 && ampm === "AM") return messages.lateNight;
	if (hour < 12 && ampm === "AM") return messages.morning;
	if (hour < 12 && ampm === "PM") return messages.afternoon;
	if (hour < 12 && ampm === "PM") return messages.evening;
	return `${hm} ${ampm}`;
}

type TimeMessageProps = {
	userName?: string;
	messageClassName?: string;
	userNameClassName?: string;
};

export default function TimeMessage({
	userName,
	messageClassName,
	userNameClassName,
}: TimeMessageProps) {
	const time = getTime(Date.now());
	const message = getTimeMessage(time);
	return (
		<h1 className={cn("text-2xl font-bold", messageClassName)}>
			{message}
			<span className={cn("font-serif", userNameClassName)}>
				{userName && `, ${userName}`}
			</span>
		</h1>
	);
}
