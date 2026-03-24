
"use client";

import { motion } from "framer-motion";
import type { MouseEventHandler } from "react";

// Framer Motion variants for the card entrance animation
export const storyBibleCardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

interface StoryBibleCardProps {
  title: string;
  status: "complete" | "incomplete";
  onClick: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export function StoryBibleCard({
  title,
  status,
  onClick,
  className,
}: StoryBibleCardProps) {
  return (
    <motion.button
      onClick={onClick}
      variants={storyBibleCardVariants}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`w-full text-left p-4 bg-white rounded-lg border border-gray-100 relative group z-10 ${className}`}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm lowercase font-sans">{title}</span>
        {status === "incomplete" && (
          <div className="absolute top-2 right-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FFD700] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-in-out origin-left"></div>
    </motion.button>
  );
}

// Skeleton loading component for when data is being fetched
export function StoryBibleCardSkeleton() {
  return (
    <div className="w-full h-[72px] p-4 bg-gray-200/50 rounded-lg">
      <div className="animate-pulse flex space-x-4">
        <div className="flex-1 space-y-3 py-1">
          <div className="h-2 bg-gray-300/50 rounded"></div>
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-gray-300/50 rounded col-span-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
