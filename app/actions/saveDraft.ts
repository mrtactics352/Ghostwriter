'use server';

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type SaveDraftInput = {
  accessToken: string;
  refreshToken: string;
  body: Record<string, unknown>;
  currentStreak: number;
  draftId: string;
  earnedXp: number;
  level: number;
  title: string;
  todayWords: number;
  wordCount: number;
};

export async function saveDraft({
  accessToken,
  refreshToken,
  body,
  currentStreak,
  draftId,
  earnedXp,
  level,
  title,
  todayWords,
  wordCount,
}: SaveDraftInput) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    },
  );

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  const {
    data: { session },
    error: getSessionError,
  } = await supabase.auth.getSession();

  if (getSessionError) {
    throw new Error(getSessionError.message);
  }

  if (!session?.user) {
    throw new Error("You must be signed in to save drafts.");
  }

  const [{ data: existingProfile, error: profileLookupError }, { data: draftData, error: draftError }] = await Promise.all([
    supabase.from("profiles").select("xp, level, current_streak").eq("id", session.user.id).maybeSingle(),
    supabase
      .from("drafts")
      .update({
        body,
        current_word_count: wordCount,
        title,
      })
      .eq("id", draftId)
      .eq("user_id", session.user.id)
      .select("id, updated_at")
      .single(),
  ]);

  if (profileLookupError) {
    throw new Error(profileLookupError.message);
  }

  if (draftError) {
    throw new Error(draftError.message);
  }

  const profilePayload = {
    current_streak: Math.max(existingProfile?.current_streak ?? 0, currentStreak),
    id: session.user.id,
    level: Math.max(existingProfile?.level ?? 1, level),
    xp: Math.max(existingProfile?.xp ?? 0, earnedXp),
  };

  const { error: profileError } = await supabase.from("profiles").upsert(profilePayload, {
    onConflict: "id",
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  const unlockedSlugs = [
    wordCount >= 100 ? "first-words" : null,
    todayWords >= 1667 ? "daily-quota" : null,
    currentStreak >= 5 ? "five-day-streak" : null,
  ].filter((value): value is string => Boolean(value));

  if (unlockedSlugs.length > 0) {
    const { data: achievements, error: achievementsError } = await supabase
      .from("achievements")
      .select("id, slug")
      .in("slug", unlockedSlugs);

    if (achievementsError) {
      throw new Error(achievementsError.message);
    }

    if (achievements.length > 0) {
      const { error: unlockError } = await supabase.from("user_achievements").upsert(
        achievements.map((achievement) => ({
          achievement_id: achievement.id,
          user_id: session.user.id,
        })),
        {
          onConflict: "user_id,achievement_id",
        },
      );

      if (unlockError) {
        throw new Error(unlockError.message);
      }
    }
  }

  return draftData;
}
