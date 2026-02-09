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
	const hour24 =
		ampm === "AM"
			? hour === 12
				? 0
				: hour
			: hour === 12
				? 12
				: hour + 12;

	if (hour24 >= 20 || hour24 < 7) return messages.lateNight;
	if (hour24 >= 7 && hour24 < 12) return messages.morning;
	if (hour24 >= 12 && hour24 < 16) return messages.afternoon;
	if (hour24 >= 16 && hour24 < 20) return messages.evening;
	return `Hey`;
}

type TimeMessageProps = {
	userName?: string;
	className?: string;
};

export default function TimeMessage({
	userName,
	className,
}: TimeMessageProps) {
	const time = getTime(Date.now());
	const message = getTimeMessage(time);
	return (
		<h1 className={cn("text-2xl font-bold", className)}>
			{message}
			<span>
				{userName && `, ${userName}`}
			</span>
		</h1>
	);
}
