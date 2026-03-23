
"use client";

import { Editor } from "@tiptap/react";
import { Sparkles, Waves, Drama, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { getSensoryExpansion, getGhostToneFix, getConflictInjection } from "@/app/actions/ai";

interface SurgicalAIToolbarProps {
  editor: Editor;
}

interface SensoryExpansion {
  see: string;
  smell: string;
  feel: string;
}

interface ConflictInjection {
  suggestion1: string;
  suggestion2: string;
  suggestion3: string;
}

export function SurgicalAIToolbar({ editor }: SurgicalAIToolbarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sensorySuggestions, setSensorySuggestions] = useState<SensoryExpansion | null>(null);
  const [ghostToneSuggestion, setGhostToneSuggestion] = useState<string | null>(null);
  const [conflictSuggestions, setConflictSuggestions] = useState<ConflictInjection | null>(null);

  const handleSensoryExpander = async () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);

    setIsLoading(true);
    const result = await getSensoryExpansion(text);
    setSensorySuggestions(result);
    setIsLoading(false);
  };

  const handleGhostToneFixer = async () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);
    const context = editor.state.doc.textBetween(Math.max(0, from - 500), from);

    setIsLoading(true);
    const result = await getGhostToneFix(text, context);
    setGhostToneSuggestion(result);
    setIsLoading(false);
  };

  const handleConflictInjector = async () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);

    setIsLoading(true);
    const result = await getConflictInjection(text);
    setConflictSuggestions(result);
    setIsLoading(false);
  };

  const handleApplySuggestion = (suggestion: string) => {
    const { from, to } = editor.state.selection;
    editor.chain().focus().deleteRange({ from, to }).insertContent(suggestion).run();
    setSensorySuggestions(null);
    setGhostToneSuggestion(null);
    setConflictSuggestions(null);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-full bg-white/75 px-4 py-3 text-sm text-ink/65 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={handleSensoryExpander}
          className="inline-flex items-center gap-2 transition hover:text-ink"
          title="Sensory Expander"
          disabled={isLoading}
        >
          {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={handleGhostToneFixer}
          className="inline-flex items-center gap-2 transition hover:text-ink"
          title="The Ghost-Tone Fixer"
          disabled={isLoading}
        >
          {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Waves className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={handleConflictInjector}
          className="inline-flex items-center gap-2 transition hover:text-ink"
          title="The Conflict Injector"
          disabled={isLoading}
        >
          {isLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Drama className="h-5 w-5" />}
        </button>
      </div>
      {sensorySuggestions && (
        <div className="flex flex-col gap-2 rounded-md bg-white/75 p-4 text-sm text-ink/65 shadow-sm backdrop-blur-md">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/45">See</p>
            <p>{sensorySuggestions.see}</p>
            <button onClick={() => handleApplySuggestion(sensorySuggestions.see)} className="rounded-full bg-ink px-4 py-2 text-parchment transition hover:bg-ink/90">Apply</button>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/45">Smell</p>
            <p>{sensorySuggestions.smell}</p>
            <button onClick={() => handleApplySuggestion(sensorySuggestions.smell)} className="rounded-full bg-ink px-4 py-2 text-parchment transition hover:bg-ink/90">Apply</button>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/45">Feel</p>
            <p>{sensorySuggestions.feel}</p>
            <button onClick={() => handleApplySuggestion(sensorySuggestions.feel)} className="rounded-full bg-ink px-4 py-2 text-parchment transition hover:bg-ink/90">Apply</button>
          </div>
        </div>
      )}
      {ghostToneSuggestion && (
        <div className="flex flex-col gap-2 rounded-md bg-white/75 p-4 text-sm text-ink/65 shadow-sm backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/45">Ghost-Tone Fix</p>
          <p>{ghostToneSuggestion}</p>
          <button onClick={() => handleApplySuggestion(ghostToneSuggestion)} className="rounded-full bg-ink px-4 py-2 text-parchment transition hover:bg-ink/90">Apply</button>
        </div>
      )}
      {conflictSuggestions && (
        <div className="flex flex-col gap-2 rounded-md bg-white/75 p-4 text-sm text-ink/65 shadow-sm backdrop-blur-md">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/45">Conflict Injection</p>
          <div className="flex flex-col gap-2">
            <p>{conflictSuggestions.suggestion1}</p>
            <button onClick={() => handleApplySuggestion(conflictSuggestions.suggestion1)} className="rounded-full bg-ink px-4 py-2 text-parchment transition hover:bg-ink/90">Apply</button>
          </div>
          <div className="flex flex-col gap-2">
            <p>{conflictSuggestions.suggestion2}</p>
            <button onClick={() => handleApplySuggestion(conflictSuggestions.suggestion2)} className="rounded-full bg-ink px-4 py-2 text-parchment transition hover:bg-ink/90">Apply</button>
          </div>
          <div className="flex flex-col gap-2">
            <p>{conflictSuggestions.suggestion3}</p>
            <button onClick={() => handleApplySuggestion(conflictSuggestions.suggestion3)} className="rounded-full bg-ink px-4 py-2 text-parchment transition hover:bg-ink/90">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}
