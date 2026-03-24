"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, LoaderCircle } from "lucide-react";
import { useState, useEffect, FormEvent, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

interface StoryElement {
  id: string;
  name: string;
  type: string;
  details: any; // Simplified to bypass type errors
  level: number;
  xp: number;
}

interface StoryElementEditorProps {
  element: StoryElement | null;
  onClose: () => void;
  onSave: (updatedElement: StoryElement) => void;
}

export function StoryElementEditor({
  element,
  onClose,
  onSave,
}: StoryElementEditorProps) {
  const [details, setDetails] = useState<any>(element?.details || {});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDetails(element?.details || {});
  }, [element]);

  const handleSave = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!element) return;
    setIsSaving(true);

    try {
      // Using 'as any' here ensures the compiler doesn't look for Supabase types 
      // that might be missing or conflicting in the build environment.
      const supabase = getSupabaseClient() as any;
      
      const { data, error } = await supabase
        .from("story_elements")
        .update({ details, updated_at: new Date().toISOString() })
        .eq("id", element.id)
        .select()
        .single();

      if (error) {
        toast.error("Failed to save changes.");
      } else {
        toast.success(`Saved ${element.name}!`);
        onSave(data as StoryElement);
      }
    } catch (err) {
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  }, [element, details, onSave]);

  const handleDetailChange = (key: string, value: string) => {
    setDetails((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      {element && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg text-ink flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-black/5 flex justify-between items-center">
              <h2 className="text-2xl font-serif">{element.name}</h2>
              <button onClick={onClose} className="text-ink/50 hover:text-ink"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {element.type === 'character' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-sans text-ink/70">Backstory</label>
                    <textarea 
                      rows={4}
                      value={details.backstory || ''}
                      onChange={e => handleDetailChange('backstory', e.target.value)}
                      className="w-full rounded-xl bg-parchment p-4 text-sm outline-none ring-1 ring-black/5"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-sans text-ink/70">Core Motivation</label>
                    <input
                      type="text"
                      value={details.core_motivation || ''}
                      onChange={e => handleDetailChange('core_motivation', e.target.value)}
                      className="w-full rounded-xl bg-parchment px-4 py-3 text-sm outline-none ring-1 ring-black/5"
                    />
                  </div>
                </>
              ) : (
                <p className="text-ink/60 text-sm">Editor for {element.type} is coming soon.</p>
              )}
            </form>

            <div className="p-6 bg-black/5 rounded-b-2xl flex justify-end gap-4">
              <button onClick={onClose} className="text-sm text-ink/60">Cancel</button>
              <button 
                type="submit" 
                onClick={handleSave} 
                disabled={isSaving}
                className="px-6 py-2 bg-ink text-parchment rounded-full text-sm font-medium disabled:opacity-50"
              >
                {isSaving ? <LoaderCircle className="animate-spin h-4 w-4" /> : 'Save'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
