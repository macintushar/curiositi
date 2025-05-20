import { ThemeProvider } from "@/components/themes/theme-provider";
import { webMetaData } from "@/constants";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";

export const metadata: Metadata = {
  title: webMetaData.siteName,
  description: webMetaData.description,
  icons: [{ rel: "icon", url: "/favicon.svg" }],
  openGraph: {
    title: webMetaData.siteName,
    description: webMetaData.description,
    url: webMetaData.url,
    siteName: webMetaData.siteName,
    images: [{ url: `${webMetaData.url}/og.png` }],
  },
};

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
