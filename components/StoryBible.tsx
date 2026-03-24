"use client";

import { useState } from "react";
import { BookOpen, Target, Users } from "lucide-react";

export function StoryBible({ editor, draftId }: { editor: any; draftId: any }) {
  const [activeTab, setActiveTab] = useState("characters");

  return (
    <div className="mt-8 border-t border-ink/10 pt-8">
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab("characters")} className={`flex items-center gap-2 text-sm ${activeTab === "characters" ? "text-ink font-bold" : "text-ink/40"}`}>
          <Users className="h-4 w-4" /> Characters
        </button>
        <button onClick={() => setActiveTab("plot")} className={`flex items-center gap-2 text-sm ${activeTab === "plot" ? "text-ink font-bold" : "text-ink/40"}`}>
          <Target className="h-4 w-4" /> Plot
        </button>
      </div>
      <div className="rounded-xl bg-ink/[0.02] p-6">
        <p className="text-sm text-ink/50 italic">Your story bible elements will appear here...</p>
      </div>
    </div>
  );
}
