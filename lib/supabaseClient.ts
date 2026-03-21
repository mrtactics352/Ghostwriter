import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseClientOptions = {
  accessToken?: string;
  persistSession?: boolean;
};

let browserClient: SupabaseClient | undefined;

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, anonKey };
}

export function createSupabaseClient(options: SupabaseClientOptions = {}) {
  const { url, anonKey } = getSupabaseEnv();
  const { accessToken, persistSession = false } = options;

  return createClient(url, anonKey, {
    auth: {
      persistSession,
      autoRefreshToken: persistSession,
      detectSessionInUrl: persistSession,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    return createSupabaseClient();
  }

  if (!browserClient) {
    browserClient = createSupabaseClient({ persistSession: true });
  }

  return browserClient;
}
