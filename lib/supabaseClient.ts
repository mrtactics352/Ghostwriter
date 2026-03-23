import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseClient() {
  // This is a client-side only function.
  // In Server Actions, create a new client for each request.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
