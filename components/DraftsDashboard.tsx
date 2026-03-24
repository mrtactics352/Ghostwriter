"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Plus, PenTool, BookOpen, Clock, LoaderCircle } from "lucide-react";

// FIX: Exported as DEFAULT to match the page import
export default function DraftsDashboard({ userId }: { userId: string }) {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDrafts() {
      try {
        const supabase = getSupabaseClient() as any; 
        // FIX: Added () to .order to fix the UI error
        const { data, error } = await supabase
          .from("drafts")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        setDrafts(data || []);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchDrafts();
  }, [userId]);

  if (loading) return (
    <div className="p-12 flex justify-center">
      <LoaderCircle className="animate-spin text-ink/20 h-8 w-8" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif text-ink">Your writing studio.</h1>
          <p className="text-ink/60">Keep the streak alive.</p>
        </div>
        <button className="flex items-center gap-2 bg-ink text-parchment px-6 py-2.5 rounded-full font-medium shadow-sm">
          <Plus size={18} /> New draft
        </button>
      </header>

      <div className="space-y-4">
        {drafts.length === 0 ? (
          <div className="bg-white/50 border-2 border-dashed border-black/5 p-16 rounded-[2rem] text-center">
            <p className="text-ink/30 italic font-serif">No drafts found. Start your journey.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {drafts.map((draft) => (
              <div key={draft.id} className="bg-white p-6 rounded-2xl border border-black/5 flex justify-between items-center shadow-sm hover:border-ink/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-parchment rounded-xl flex items-center justify-center text-ink"><PenTool size={18} /></div>
                  <h3 className="font-serif text-xl text-ink">{draft.title}</h3>
                </div>
                <div className="flex items-center gap-2 text-ink/40 text-xs uppercase tracking-widest">
                  <Clock size={12} />
                  {new Date(draft.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
