import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "./ui/button";

type NavigationButtonsProps = {
	canGoBack: boolean;
	canGoForward: boolean;
	goBack: () => void;
	goForward: () => void;
};

export default function NavigationButtons({
	canGoBack,
	canGoForward,
	goBack,
	goForward,
}: NavigationButtonsProps) {
	return (
		<div className="flex items-center gap-2">
			<Button
				variant="outline"
				onClick={goBack}
				disabled={!canGoBack}
				className="size-7"
				title="Go back"
			>
				<IconChevronLeft className="w-4 h-4" />
			</Button>
			<Button
				variant="outline"
				onClick={goForward}
				disabled={!canGoForward}
				className="size-7"
				title="Go forward"
			>
				<IconChevronRight className="w-4 h-4" />
			</Button>
		</div>
	);
}
