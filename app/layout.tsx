import type { Metadata } from "next";
import Link from "next/link";

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
          <header className="flex items-center justify-between py-3 text-sm text-ink/55">
            <Link href="/" className="font-medium tracking-[0.25em] text-ink/75 uppercase">
              Ghostwriter
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/drafts" className="transition hover:text-ink">
                Drafts
              </Link>
              <Link href="/auth" className="transition hover:text-ink">
                Sign in
              </Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
