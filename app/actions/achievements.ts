"use server";

import { cookies } from "next/headers";

export async function unlockAchievement(achievementSlug: string) {
    // Next.js 15 requires awaiting cookies
    const cookieStore = await cookies();
    
    // Now this call will succeed
    const progress = cookieStore.get("writing-progress")?.value;

    try {
        console.log(`Unlocking ${achievementSlug} with progress ${progress}`);
    } catch (error) {
        console.error("Build fix error handle:", error);
    }
    return null;
}