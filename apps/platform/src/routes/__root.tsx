import {
	HeadContent,
	Scripts,
	createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";

import type { TRPCRouter } from "@platform/integrations/trpc/router";
import type { TRPCOptionsProxy } from "@trpc/tanstack-react-query";

import { Toaster } from "@platform/components/ui/sonner";
import { ThemeProvider } from "@platform/components/theme-provider";

interface MyRouterContext {
	queryClient: QueryClient;

	trpc: TRPCOptionsProxy<TRPCRouter>;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Curiositi",
			},
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),

	shellComponent: RootDocument,
	notFoundComponent(props) {
		return <div>Not Found: {props.routeId}</div>;
	},
	errorComponent(props) {
		return <div>Error: {props.error.message}</div>;
	},
	ssr: false,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<ThemeProvider defaultTheme="system" cookieName="curiositi-theme">
					{children}
					<Toaster />
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
							TanStackQueryDevtools,
						]}
					/>
					<Scripts />
				</ThemeProvider>
			</body>
		</html>
	);
}
