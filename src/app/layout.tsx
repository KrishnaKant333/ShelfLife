import type { Metadata } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/next";

const shelfBody = DM_Sans({
  variable: "--font-shelf-body",
  subsets: ["latin"],
  display: "swap",
});

const shelfDisplay = Newsreader({
  variable: "--font-shelf-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "ShelfLife | Smarter food inventory",
    template: "%s | ShelfLife",
  },
  description: "Smart food inventory management for households and businesses",
  openGraph: {
    title: "ShelfLife | Smarter food inventory",
    description: "Track freshness, reduce waste, and make better use of every product.",
    type: "website",
    siteName: "ShelfLife",
  },
  twitter: {
    card: "summary",
    title: "ShelfLife | Smarter food inventory",
    description: "Track freshness, reduce waste, and make better use of every product.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${shelfBody.variable} ${shelfDisplay.variable} scroll-fog`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
