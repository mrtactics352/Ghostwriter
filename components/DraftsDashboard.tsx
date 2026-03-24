"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Plus, LogOut, LoaderCircle, BookOpen, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function DraftsDashboard({ userId }: { userId: string }) {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // 1. Fetch Drafts with fixed .order() syntax
  const fetchDrafts = async () => {
    try {
      const supabase = getSupabaseClient() as any; // Fix for type errors
      const { data, error } = await supabase
        .from("drafts")
        .select("id, title, current_word_count, status, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setDrafts(data || []);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchDrafts();
  }, [userId]);

  // 2. Function to create a new draft
  const handleCreateDraft = async () => {
    setIsCreating(true);
    try {
      const supabase = getSupabaseClient() as any;
      const { data, error } = await supabase
        .from("drafts")
        .insert([
          { 
            user_id: userId, 
            title: "Untitled Story", 
            status: "draft",
            current_word_count: 0 
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      toast.success("New draft created!");
      setDrafts([data, ...drafts]); // Update UI immediately
    } catch (err: any) {
      toast.error("Could not create draft.");
      console.error(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoaderCircle className="animate-spin text-ink/20 h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-serif mb-2 text-ink">Your writing studio.</h1>
          <p className="text-ink/60">Open a draft and keep the streak alive.</p>
        </div>
        <button 
          onClick={handleCreateDraft}
          disabled={isCreating}
          className="flex items-center gap-2 bg-ink text-parchment px-6 py-2.5 rounded-full font-medium hover:bg-ink/90 transition shadow-sm disabled:opacity-50"
        >
          {isCreating ? <LoaderCircle className="animate-spin h-4 w-4" /> : <Plus size={18} />}
          New draft
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <label className="text-[10px] uppercase tracking-[0.2em] text-ink/40 font-bold block mb-1">XP</label>
          <span className="text-3xl font-serif text-ink">0</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <label className="text-[10px] uppercase tracking-[0.2em] text-ink/40 font-bold block mb-1">Level</label>
          <span className="text-3xl font-serif text-ink">1</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5">
          <label className="text-[10px] uppercase tracking-[0.2em] text-ink/40 font-bold block mb-1">Streak</label>
          <span className="text-3xl font-serif text-ink">0 days</span>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-ink/30 font-bold flex items-center gap-2">
          <BookOpen size={12} /> Recent Drafts
        </h2>
        
        {drafts.length === 0 ? (
          <div className="bg-white/40 border-2 border-dashed border-black/5 p-16 rounded-[2rem] text-center">
            <p className="text-ink/30 italic font-serif text-lg">Your library is empty. Start your 30-day journey today.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {drafts.map((draft) => (
              <div 
                key={draft.id} 
                className="group bg-white p-6 rounded-2xl border border-black/5 hover:border-ink/20 hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-parchment rounded-xl flex items-center justify-center group-hover:bg-ink group-hover:text-parchment transition-colors">
                    <PenTool size={18} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl text-ink">{draft.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-ink/40 uppercase tracking-widest mt-1">
                      <span>{draft.current_word_count} words</span>
                      <span className="w-1 h-1 bg-ink/10 rounded-full" />
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(draft.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium text-ink/60 underline underline-offset-4">Open Manuscript</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
