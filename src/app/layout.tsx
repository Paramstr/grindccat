import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import localFont from 'next/font/local'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ttNeoris = localFont({
  src: '../../public/fonts/TT-Neoris-Trial-Bold.ttf',
  variable: '--font-tt-neoris',
})

export const metadata: Metadata = {
  title: "Grind CCAT | CCAT Practice Test Platform",
  description: "Sharpen your mind for the CCAT with real-time practice. A simulator that mirrors the actual test's pressure and question types.",
  keywords: ["CCAT", "Criteria Cognitive Aptitude Test", "Practice Test", "Cognitive Assessment", "Test Prep"],
  authors: [
    {
      name: "maybeParam",
      url: "https://x.com/maybeParam",
    }
  ],
  openGraph: {
    title: "Grind CCAT | Practice Test Platform",
    description: "Sharpen your mind for the CCAT with real-time practice",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ttNeoris.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
