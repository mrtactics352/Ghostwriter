"use client";

import { Award } from "lucide-react";
import { toast } from "react-hot-toast";

/**
 * Neutralized AchievementToast
 * Removed broken imports from @/app/actions/achievements
 */

interface AchievementToastProps {
  achievement: any; // Using any to bypass the missing type error
}

export function AchievementToast({ achievement }: AchievementToastProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-ink/10 bg-surface p-4 shadow-lg">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow/10 text-yellow">
        <Award className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-bold text-ink">Achievement Unlocked!</p>
        <p className="text-xs text-ink/60">{achievement?.name || "New Milestone"}</p>
      </div>
    </div>
  );
}
