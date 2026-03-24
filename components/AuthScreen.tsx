"use client";

import { LoaderCircle, LogIn, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { getSupabaseClient } from "@/lib/supabaseClient";

type AuthMode = "signin" | "signup";

// This is a comment to trigger a new deployment.

export function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const modeLabel = useMemo(() => {
    return mode === "signin"
      ? {
          cta: "Sign in",
          icon: <LogIn className="h-4 w-4" />,
          swap: "Need an account? Create one",
        }
      : {
          cta: "Create account",
          icon: <UserPlus className="h-4 w-4" />,
          swap: "Already have an account? Sign in",
        };
  }, [mode]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage(null);

    try {
      const supabase = getSupabaseClient();

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }

        router.push("/drafts");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      setStatus("success");
      setMessage(
        data.session
          ? "Account created. Redirecting you to your drafts…"
          : "Check your inbox to confirm your account, then sign in.",
      );

      if (data.session) {
        router.push("/drafts");
        router.refresh();
      }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to authenticate right now.");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-12 py-12 lg:flex-row lg:items-center lg:justify-between">
      <section className="max-w-xl space-y-6">
        <p className="text-sm uppercase tracking-[0.3em] text-ink/45">Ghostwriter</p>
        <h1 className="font-serif text-5xl leading-tight text-ink sm:text-6xl">
          Sign in to turn your drafts, streaks, and XP into a real writing practice.
        </h1>
        <p className="text-lg leading-8 text-ink/70">
          Your work syncs to Supabase, your progress persists, and every draft opens in the same minimalist editor you already have running.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm text-ink/60 shadow-sm">
          <Sparkles className="h-4 w-4" />
          TipTap editor, local backup, autosave, and streak tracking.
        </div>
      </section>

      <section className="w-full max-w-md rounded-[2rem] bg-white/80 p-8 shadow-ambient backdrop-blur">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm text-ink/60">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl bg-parchment px-4 py-3 text-sm text-ink outline-none ring-1 ring-black/5 transition focus:ring-2 focus:ring-ink/20"
              placeholder="writer@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm text-ink/60">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl bg-parchment px-4 py-3 text-sm text-ink outline-none ring-1 ring-black/5 transition focus:ring-2 focus:ring-ink/20"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-parchment transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === "loading" ? <LoaderCircle className="h-4 w-4 animate-spin" /> : modeLabel.icon}
            {modeLabel.cta}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode((current) => (current === "signin" ? "signup" : "signin"));
              setMessage(null);
              setStatus("idle");
            }}
            className="text-sm text-ink/55 transition hover:text-ink"
          >
            {modeLabel.swap}
          </button>

          {message ? <p className={`text-sm ${status === "error" ? "text-ember" : "text-ink/65"}`}>{message}</p> : null}
        </form>

        <div className="mt-8 border-t border-black/5 pt-6 text-sm text-ink/50">
          Want a no-login sandbox first?{" "}
          <Link href="/drafts/demo" className="text-ink underline underline-offset-4">
            Open the offline demo draft
          </Link>
          .
        </div>
      </section>
    </div>
  );
}
