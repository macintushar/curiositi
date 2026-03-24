import {
	Icon,
	IconDeviceLaptop,
	IconDeviceMobile,
	IconMoonStars,
	IconSunHigh,
} from "@tabler/icons-react";
import { Theme } from "./provider";

export const themes: {
	label: string;
	value: Theme;
	icon: Icon;
	mobileIcon?: Icon;
}[] = [
	{
		label: "System",
		value: "system",
		icon: IconDeviceLaptop,
		mobileIcon: IconDeviceMobile,
	},
	{
		label: "Dark",
		value: "dark",
		icon: IconMoonStars,
	},
	{
		label: "Light",
		value: "light",
		icon: IconSunHigh,
	},
];
