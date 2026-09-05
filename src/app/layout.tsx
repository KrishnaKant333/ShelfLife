import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
