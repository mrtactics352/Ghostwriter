"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Plus, LogOut } from "lucide-react";

export default function DraftsDashboard({ userId }: { userId: string }) {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDrafts() {
      try {
        const supabase = getSupabaseClient() as any;
        
        // FIX: Ensure it is .order(...) and not .order without the function call
        const { data, error: draftsError } = await supabase
          .from("drafts")
          .select("id, title, current_word_count, status, updated_at")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (draftsError) throw draftsError;
        setDrafts(data || []);
      } catch (err: any) {
        console.error("Database error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchDrafts();
  }, [userId]);

  if (loading) return <div className="p-8 text-ink/50">Loading your studio...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif mb-2">Your writing studio.</h1>
          <p className="text-ink/60">Open a draft, keep the streak alive, and let the editor handle backups.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-ink text-parchment px-6 py-2 rounded-full font-medium hover:bg-ink/90 transition shadow-sm">
            <Plus size={18} />
            New draft
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <label className="text-[10px] uppercase tracking-widest text-ink/40 font-bold block mb-1">XP</label>
          <span className="text-3xl font-serif">0</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <label className="text-[10px] uppercase tracking-widest text-ink/40 font-bold block mb-1">Level</label>
          <span className="text-3xl font-serif">1</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <label className="text-[10px] uppercase tracking-widest text-ink/40 font-bold block mb-1">Current Streak</label>
          <span className="text-3xl font-serif">0 days</span>
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-[10px] uppercase tracking-widest text-ink/40 font-bold flex items-center gap-2">
          <Plus size={12} /> Drafts
        </label>
        
        {error && <p className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
        
        {drafts.length === 0 ? (
          <div className="bg-white/50 border border-dashed border-black/10 p-12 rounded-2xl text-center">
            <p className="text-ink/40 italic">No drafts yet. Create your first one to begin.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white p-6 rounded-2xl border border-black/5 hover:border-ink/20 transition cursor-pointer flex justify-between items-center">
                <h3 className="font-serif text-xl">{draft.title}</h3>
                <span className="text-xs text-ink/40">{new Date(draft.updated_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
