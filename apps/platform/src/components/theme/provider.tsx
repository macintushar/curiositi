import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	cookieName?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
	theme: "system",
	setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function getCookie(name: string): string | undefined {
	if (typeof document === "undefined") return undefined;
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		return parts.pop()?.split(";").shift();
	}
	return undefined;
}

function setCookie(name: string, value: string): void {
	if (typeof document === "undefined") return;
	// biome-ignore lint/suspicious/noDocumentCookie: <This is fine for themes for now>
	document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
	cookieName = "theme",
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => {
		// On initial render, try to get theme from cookie
		const cookieTheme = getCookie(cookieName) as Theme | undefined;
		return cookieTheme || defaultTheme;
	});

	useEffect(() => {
		const root = window.document.documentElement;

		root.classList.remove("light", "dark");

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";

			root.classList.add(systemTheme);
			return;
		}

		root.classList.add(theme);
	}, [theme]);

	const value = {
		theme,
		setTheme: (newTheme: Theme) => {
			setCookie(cookieName, newTheme);
			setTheme(newTheme);
		},
	};

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext);

	if (context === undefined)
		throw new Error("useTheme must be used within a ThemeProvider");

	return context;
};

/**
 * Server-side helper to get theme from request cookies.
 * Use this in your root route to get the initial theme and set it on the <html> element.
 *
 * @example
 * // In __root.tsx
 * const theme = getThemeFromCookies(request.headers.get('cookie'), 'curiositi-theme');
 * <html lang="en" className={theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : ''}>
 */
export function getThemeFromCookies(
	cookieHeader: string | null,
	cookieName = "theme"
): Theme | null {
	if (!cookieHeader) return null;
	const cookies = cookieHeader.split(";").reduce(
		(acc, cookie) => {
			const [key, value] = cookie.trim().split("=");
			if (key && value) {
				acc[key] = value;
			}
			return acc;
		},
		{} as Record<string, string>
	);
	const theme = cookies[cookieName] as Theme | undefined;
	if (theme && ["dark", "light", "system"].includes(theme)) {
		return theme;
	}
	return null;
}

/**
 * Helper to resolve what class should be on the <html> element for SSR.
 * Returns the theme class name or empty string for 'system' theme.
 */
export function getThemeClass(theme: Theme | null): string {
	if (theme === "dark") return "dark";
	if (theme === "light") return "light";
	return "";
}
