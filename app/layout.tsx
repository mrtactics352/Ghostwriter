import type { Metadata } from "next";

import { AppHeader } from "@/components/AppHeader";

import "./globals.css";

export const metadata: Metadata = {
  title: "Ghostwriter",
  description: "Minimalist, high-performance story writing for focused authors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-parchment font-sans text-ink">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-10">
          <AppHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
