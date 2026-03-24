"use client";

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

/**
 * CoverDesigner - Neutralized Version
 * Removes all @supabase/supabase-js imports to fix module resolution errors.
 */

interface CoverDesign {
  title: string;
  author_name: string;
  theme_color: string;
  font_style: string;
}

export function CoverDesigner({ draftId }: { draftId: string }) {
  const [design, setDesign] = useState<CoverDesign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDesign() {
      try {
        // 'as any' prevents the compiler from checking for Supabase types
        const supabase = getSupabaseClient() as any;
        
        const { data, error } = await supabase
          .from("covers")
          .select("*")
          .eq("draft_id", draftId)
          .maybeSingle();

        if (error) throw error;
        setDesign(data);
      } catch (err) {
        console.error("Cover load failed (silent):", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (draftId) {
      void loadDesign();
    }
  }, [draftId]);

  if (isLoading) {
    return <div className="animate-pulse bg-parchment/50 h-64 rounded-[2rem] border border-ink/5" />;
  }

  return (
    <div className="rounded-[2rem] border-2 border-dashed border-ink/10 p-12 flex flex-col items-center justify-center text-center space-y-6 bg-white/30 backdrop-blur-sm">
      <div 
        className="w-40 h-56 shadow-2xl rounded-md transition-transform duration-500 hover:scale-105 flex flex-col overflow-hidden"
        style={{ 
          backgroundColor: design?.theme_color || '#e5e5e5',
          border: '1px solid rgba(0,0,0,0.05)' 
        }}
      >
        <div className="p-4 flex flex-col h-full justify-between items-center text-center">
          <h3 className="font-serif text-lg leading-tight mt-4" style={{ fontFamily: design?.font_style || 'serif' }}>
            {design?.title || 'Untitled'}
          </h3>
          <div className="w-8 h-[1px] bg-black/20" />
          <p className="text-[10px] uppercase tracking-[0.2em] mb-4 opacity-60">
            {design?.author_name || 'Author'}
          </p>
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-ink/40 font-medium">Project Cover</p>
        <p className="text-xs text-ink/30 italic">Generated from story metadata</p>
      </div>
    </div>
  );
}
