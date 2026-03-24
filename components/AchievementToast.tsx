
"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";
import type { Toast } from "react-hot-toast";
import type { Achievement } from "@/app/actions/achievements";

interface AchievementToastProps {
  t: Toast;
  achievement: Achievement;
}

/**
 * A celebratory toast notification for unlocking an achievement.
 */
export function AchievementToast({ achievement }: Omit<AchievementToastProps, 't'>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className={`max-w-sm w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-lg pointer-events-auto flex overflow-hidden ring-1 ring-white/10`}
    >
        {/* Sparkle effect */}
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>

        <div className="flex-1 w-0 p-4 relative">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                        <Award className="h-7 w-7 text-white/90" />
                    </div>
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-semibold text-gray-100">
                    Achievement Unlocked!
                    </p>
                    <p className="mt-1 text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
                    {achievement.name}
                    </p>
                </div>
            </div>
        </div>
        <div className="flex items-center justify-center border-l border-white/10 px-4 bg-white/5">
            <div className="text-center">
                <span className="font-bold text-lg text-yellow-400">+{achievement.xp_reward}</span>
                <span className="text-xs -mt-1 block text-white/50">XP</span>
            </div>
        </div>
    </motion.div>
  );
}
