"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Plus, BookOpen, PenTool, Clock, LoaderCircle } from "lucide-react";

// This is a DEFAULT export
export default function DraftsDashboard({ userId }: { userId: string }) {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDrafts() {
      try {
        const supabase = getSupabaseClient() as any; 
        // FIX: .order() is a function call
        const { data, error } = await supabase
          .from("drafts")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        setDrafts(data || []);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchDrafts();
  }, [userId]);

  if (loading) return <div className="p-12 animate-pulse text-ink/20">Loading Studio...</div>;

  return (
    <div className="max-w-5xl mx-auto p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-serif">Your writing studio.</h1>
        <button className="flex items-center gap-2 bg-ink text-parchment px-6 py-2.5 rounded-full font-medium shadow-sm">
          <Plus size={18} /> New draft
        </button>
      </header>

      <div className="space-y-4">
        {drafts.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-black/5 p-16 rounded-[2rem] text-center text-ink/30 italic">
            No drafts yet. Create your first one to begin.
          </div>
        ) : (
          <div className="grid gap-4">
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white p-6 rounded-2xl border border-black/5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-parchment rounded-xl flex items-center justify-center"><PenTool size={18} /></div>
                  <h3 className="font-serif text-xl">{draft.title}</h3>
                </div>
                <span className="text-xs text-ink/40">{new Date(draft.updated_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
