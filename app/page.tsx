"use client";

// FIX: Removed { } to match the default export
import DraftsDashboard from "@/components/DraftsDashboard";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function DraftsPage() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient() as any;
    supabase.auth.getUser().then(({ data }: any) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, []);

  if (!userId) return (
    <div className="min-h-screen bg-parchment flex items-center justify-center">
      <p className="text-ink/30 italic animate-pulse font-serif">Entering the studio...</p>
    </div>
  );

  return <DraftsDashboard userId={userId} />;
}
