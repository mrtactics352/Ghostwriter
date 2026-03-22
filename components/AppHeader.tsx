"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { getSupabaseClient } from "@/lib/supabaseClient";

export function AppHeader() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseClient();

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setIsReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
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
