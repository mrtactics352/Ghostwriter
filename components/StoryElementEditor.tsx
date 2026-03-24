"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, LoaderCircle } from "lucide-react";
import { useState, useEffect, FormEvent, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

// Re-defining for use in this component. Ideally, this would be in a shared types file.
interface StoryElement {
  id: string;
  name: string;
  type: string;
  details: Record<string, string> | null;
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
  const [details, setDetails] = useState(element?.details || {});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // When a new element is passed in, reset the form state
    setDetails(element?.details || {});
  }, [element]);

  const handleSave = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!element) return;
    setIsSaving(true);

    try {
      // 'as any' bypasses strict database typing that causes 'Expected 0 arguments' error
      const supabase = getSupabaseClient() as any;
      
      const { data, error } = await supabase
        .from("story_elements")
        .update({ details, updated_at: new Date().toISOString() })
        .eq("id", element.id)
        .select()
        .single();

      if (error) {
        toast.error("Failed to save changes.");
        console.error("Error saving story element:", error);
      } else {
        toast.success(`Saved ${element.name}!`);
        onSave(data as StoryElement);
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [element, details, onSave]);

  const handleDetailChange = (key: string, value: string) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatePresence>
      {element && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white/95 rounded-2xl shadow-ambient w-full max-w-lg text-ink flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-black/5 flex justify-between items-center">
                 <h2 className="text-2xl font-serif">{element.name}</h2>
                 <button onClick={onClose} className="p-1 rounded-full text-ink/50 hover:bg-black/10 hover:text-ink transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6 flex-grow overflow-y-auto">
                {/* Generic fallback for undefined types */}
                {element.type !== 'character' && (
                    <p className="text-ink/60 text-sm">Editing for type &quot;{element.type}&quot; is not yet implemented.</p>
                )}

                {element.type === 'character' && (
                    <>
                        <div className="space-y-2">
                            <label htmlFor="backstory" className="text-sm lowercase font-sans text-ink/70 tracking-widest">Backstory</label>
                            <textarea 
                                id="backstory" 
                                rows={5}
                                value={(details as any).backstory || ''}
                                onChange={e => handleDetailChange('backstory', e.target.value)}
                                className="w-full rounded-xl bg-parchment p-4 text-sm outline-none ring-1 ring-black/5 focus:ring-2 focus:ring-ink/20 transition"
                                placeholder={`What is ${element.name}\'s history, in brief?`}
                            />
