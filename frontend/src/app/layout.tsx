import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GestureSpeak — AI Sign Language Communication Platform",
  description:
    "Real-time AI-powered sign language recognition and translation. Break communication barriers with gesture-to-text, speech, and multi-language support.",
  keywords: ["sign language", "AI", "gesture recognition", "accessibility", "real-time translation"],
  authors: [{ name: "GestureSpeak" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
