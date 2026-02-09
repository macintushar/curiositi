"use client";

import {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
	type ReactNode,
} from "react";
import { useNavigate } from "@tanstack/react-router";

type NavigationEntry = {
	path: string;
	spaceId?: string | null;
	timestamp: number;
};

type NavigationHistoryContextType = {
	canGoBack: boolean;
	canGoForward: boolean;
	pushEntry: (entry: Omit<NavigationEntry, "timestamp">) => void;
	goBack: () => void;
	goForward: () => void;
};

const NavigationHistoryContext =
	createContext<NavigationHistoryContextType | null>(null);

export function NavigationHistoryProvider({
	children,
}: {
	children: ReactNode;
}) {
	const navigate = useNavigate();

	// Use refs to store history state to avoid dependency issues in callbacks
	const historyRef = useRef<NavigationEntry[]>([]);
	const currentIndexRef = useRef(-1);

	// State only for triggering re-renders when canGoBack/canGoForward changes
	const [, forceUpdate] = useState(0);

	const canGoBack = currentIndexRef.current > 0;
	const canGoForward = currentIndexRef.current < historyRef.current.length - 1;

	const pushEntry = useCallback((entry: Omit<NavigationEntry, "timestamp">) => {
		const history = historyRef.current;
		const currentIndex = currentIndexRef.current;

		// If we're not at the end of history, truncate forward history
		const newHistory = history.slice(0, currentIndex + 1);

		// Don't add duplicate consecutive entries
		const lastEntry = newHistory[newHistory.length - 1];
		if (
			lastEntry?.path === entry.path &&
			lastEntry?.spaceId === entry.spaceId
		) {
			return;
		}

		historyRef.current = [
			...newHistory,
			{
				...entry,
				timestamp: Date.now(),
			},
		];
		currentIndexRef.current = currentIndexRef.current + 1;

		// Trigger re-render to update canGoBack/canGoForward
		forceUpdate((n) => n + 1);
	}, []);

	const goBack = useCallback(() => {
		if (currentIndexRef.current <= 0) return;

		const newIndex = currentIndexRef.current - 1;
		const entry = historyRef.current[newIndex];
		if (entry) {
			currentIndexRef.current = newIndex;
			forceUpdate((n) => n + 1);

			if (entry.spaceId) {
				navigate({
					to: "/app/space/$spaceId",
					params: { spaceId: entry.spaceId },
				});
			} else {
				navigate({ to: entry.path as "/app" });
			}
		}
	}, [navigate]);

	const goForward = useCallback(() => {
		if (currentIndexRef.current >= historyRef.current.length - 1) return;

		const newIndex = currentIndexRef.current + 1;
		const entry = historyRef.current[newIndex];
		if (entry) {
			currentIndexRef.current = newIndex;
			forceUpdate((n) => n + 1);

			if (entry.spaceId) {
				navigate({
					to: "/app/space/$spaceId",
					params: { spaceId: entry.spaceId },
				});
			} else {
				navigate({ to: entry.path as "/app" });
			}
		}
	}, [navigate]);

	return (
		<NavigationHistoryContext.Provider
			value={{
				canGoBack,
				canGoForward,
				pushEntry,
				goBack,
				goForward,
			}}
		>
			{children}
		</NavigationHistoryContext.Provider>
	);
}

export function useNavigationHistory() {
	const context = useContext(NavigationHistoryContext);
	if (!context) {
		throw new Error(
			"useNavigationHistory must be used within a NavigationHistoryProvider"
		);
	}
	return context;
}
