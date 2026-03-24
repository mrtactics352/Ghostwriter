"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Clean Ghostwriter Header
 * Removed Supabase dependencies to fix Vercel Build.
 */
export function AppHeader() {
  const router = useRouter();
  
  // We use a local state for now to avoid Supabase import errors
  // This satisfies the "isReady" and "session" checks in your JSX
  const [session, setSession] = useState<any>(null);
  const [isReady, setIsReady] = useState(true);

  const handleSignOut = async () => {
    // Temporary sign out logic for Ghostwriter
    setSession(null);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between py-3 text-sm text-ink/55">
      <Link href="/" className="font-medium tracking-[0.25em] text-ink/75 uppercase">
        Ghostwriter
      </Link>
      <nav className="flex items-center gap-4">
        <Link href="/drafts" className="transition hover:text-ink">
          Drafts
        </Link>
        {isReady && session ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 transition hover:text-ink"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        ) : (
          <Link href="/auth" className="transition hover:text-ink">
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
