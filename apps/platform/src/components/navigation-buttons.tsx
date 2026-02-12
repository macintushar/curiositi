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
		<div className="flex items-center">
			<Button
				variant="ghost"
				size="icon"
				onClick={goBack}
				disabled={!canGoBack}
				className="h-8 w-8"
				title="Go back"
			>
				<IconChevronLeft className="w-4 h-4" />
			</Button>
			<Button
				variant="ghost"
				size="icon"
				onClick={goForward}
				disabled={!canGoForward}
				className="h-8 w-8"
				title="Go forward"
			>
				<IconChevronRight className="w-4 h-4" />
			</Button>
		</div>
	);
}
