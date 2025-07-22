import { ThemeProvider } from "@/components/themes/theme-provider";
import { Toaster } from "@/components/ui/sonner";

import { webMetaData } from "@/constants/landing-constants";
import "@/styles/globals.css";

import { type Metadata } from "next";
import {
  Instrument_Sans,
  Instrument_Serif,
  Noto_Color_Emoji,
} from "next/font/google";

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
  style: ["normal", "italic"],
  variable: "--font-instrument-sans",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "400",
  variable: "--font-instrument-serif",
});

const notoEmoji = Noto_Color_Emoji({
  subsets: ["emoji"],
  weight: "400",
  variable: "--font-noto-emoji",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${instrumentSerif.variable} ${notoEmoji.variable}`}
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
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
