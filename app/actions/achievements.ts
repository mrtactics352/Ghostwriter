
"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// This would ideally be defined in a shared types file
export interface Achievement {
    id: string;
    name: string;
    description: string;
    xp_reward: number;
}

/**
 * Unlocks a specific achievement for the currently authenticated user.
 * It checks if the user has already unlocked it before attempting to insert.
 *
 * @param achievementSlug The unique slug for the achievement to be unlocked (e.g., 'first_element').
 * @returns The achievement details if newly unlocked, otherwise null.
 */
export async function unlockAchievement(achievementSlug: string): Promise<Achievement | null> {
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
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error("User must be authenticated to unlock an achievement.");
        return null;
    }

    // 1. Fetch the achievement details from the public catalog
    const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('*')
        .eq('slug', achievementSlug)
        .single();

    if (achievementError || !achievement) {
        console.error(`Achievement with slug "${achievementSlug}" not found.`, achievementError);
        return null;
    }
    
    // 2. Check if the user has already unlocked this achievement
    const { data: existingUnlock, error: checkError } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user.id)
        .eq('achievement_id', achievement.id)
        .maybeSingle();

    if (checkError) {
        console.error("Error checking for existing achievement unlock:", checkError);
        return null;
    }

    if (existingUnlock) {
        // User has already unlocked this achievement, so we do nothing.
        return null;
    }

    // 3. If not unlocked, insert a new record into user_achievements
    const { error: insertError } = await supabase
        .from('user_achievements')
        .insert({
            user_id: user.id,
            achievement_id: achievement.id,
        });

    if (insertError) {
        console.error("Error unlocking achievement:", insertError);
        return null;
    }

    // 4. Optionally, update user's total XP
    // For now, we'll keep this separate. You might want a different function to recalculate user XP.

    console.log(`Achievement "${achievement.name}" unlocked for user ${user.id}!`);
    return achievement as Achievement;
}
