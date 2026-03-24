"use client";

// FIX: We import without { } because DraftsDashboard is a default export
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

  if (!userId) return <div className="p-12 text-ink/30 italic">Verifying session...</div>;

  return <DraftsDashboard userId={userId} />;
}
