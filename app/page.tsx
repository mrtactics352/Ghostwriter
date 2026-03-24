"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Sparkles, PenTool, Trophy, Zap, LogOut, User as UserIcon, LoaderCircle } from "lucide-react";

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient() as any;

    // Check for active session on mount
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    checkUser();

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient() as any;
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-parchment text-ink selection:bg-ink/10">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ink rounded-lg flex items-center justify-center">
            <Sparkles className="text-parchment h-5 w-5" />
          </div>
          <span className="font-serif text-xl tracking-tight">Ghostwriter</span>
        </div>
        
        <div className="flex items-center gap-4">
          {loading ? (
            <LoaderCircle className="animate-spin h-5 w-5 text-ink/20" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link 
                href="/dashboard" 
                className="bg-ink text-parchment px-6 py-2.5 rounded-full text-sm font-medium hover:bg-ink/90 transition shadow-sm flex items-center gap-2"
              >
                <UserIcon size={14} />
                My Studio
              </Link>
              <button 
                onClick={handleSignOut}
                className="p-2.5 text-ink/40 hover:text-ink transition hover:bg-ink/5 rounded-full"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link 
              href="/auth" 
              className="bg-ink text-parchment px-6 py-2.5 rounded-full text-sm font-medium hover:bg-ink/90 transition shadow-sm"
            >
              Get Started
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ink/5 text-ink/60 text-xs font-medium mb-8 border border-ink/5">
            <Zap className="h-3 w-3" />
            <span>30-Day Writing Challenge</span>
          </div>
          <h1 className="font-serif text-7xl lg:text-8xl leading-[0.9] tracking-tighter mb-8">
            Finish your story. <br/> 
            <span className="text-ink/30 italic">Finally.</span>
          </h1>
          <p className="text-xl text-ink/60 leading-relaxed max-w-xl mb-12">
            Ghostwriter is a gamified writing environment designed to help you crush writer's block and complete your manuscript in 30 days.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              href={user ? "/dashboard" : "/auth"} 
              className="bg-ink text-parchment px-8 py-4 rounded-full text-lg font-medium hover:bg-ink/90 transition shadow-md flex items-center gap-3"
            >
              {user ? "Continue Writing" : "Start Writing Free"}
              <PenTool className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-3 gap-12 mt-32 border-t border-ink/10 pt-16">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Trophy className="text-ink h-6 w-6" />
            </div>
            <h3 className="font-serif text-2xl">Daily Streaks</h3>
            <p className="text-ink/50 leading-relaxed">Gamified XP and badges for every word you write. Keep the streak alive to reach the finish line.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Sparkles className="text-ink h-6 w-6" />
            </div>
            <h3 className="font-serif text-2xl">AI-Free Focus</h3>
            <p className="text-ink/50 leading-relaxed">A minimalist editor designed for pure creative output, not distractions.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Zap className="text-ink h-6 w-6" />
            </div>
            <h3 className="font-serif text-2xl">30-Day Roadmap</h3>
            <p className="text-ink/50 leading-relaxed">Structured goals to take you from a blank page to a finished draft in one month.</p>
          </div>
        </div>
      </main>

      <footer className="px-8 py-12 border-t border-ink/5 text-center">
        <p className="text-sm text-ink/30">© 2026 Ghostwriter. Built for the modern author.</p>
      </footer>
    </div>
  );
}
