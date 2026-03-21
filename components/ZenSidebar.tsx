"use client";

import { Flame, TimerReset } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ZenSidebarProps = {
  currentStreak: number;
  dailyGoal: number;
  todayWords: number;
};

const SPRINT_SECONDS = 20 * 60;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export function ZenSidebar({ currentStreak, dailyGoal, todayWords }: ZenSidebarProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(SPRINT_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          return SPRINT_SECONDS;
        }

        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const sprintLabel = useMemo(() => {
    if (!isRunning && remainingSeconds === SPRINT_SECONDS) {
      return "Sprint Timer";
    }

    return isRunning ? `Focus ${formatTime(remainingSeconds)}` : "Restart Sprint";
  }, [isRunning, remainingSeconds]);

  const toggleSprint = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    setRemainingSeconds((value) => (value === 0 ? SPRINT_SECONDS : value));
    setIsRunning(true);
  };

  const resetSprint = () => {
    setIsRunning(false);
    setRemainingSeconds(SPRINT_SECONDS);
  };

  return (
    <aside className="fixed right-4 top-20 z-40 hidden w-56 rounded-3xl bg-white/70 p-4 text-sm shadow-ambient backdrop-blur md:block">
      <div className="space-y-4 font-sans text-ink/75">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink/40">Streak</p>
          <p className="mt-2 flex items-center gap-2 text-base text-ink">
            <Flame className="h-4 w-4 text-ember" />
            {currentStreak} {currentStreak === 1 ? "Day" : "Days"}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ink/40">Today</p>
          <p className="mt-2 text-base text-ink">{todayWords.toLocaleString()} / {dailyGoal.toLocaleString()} words</p>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={toggleSprint}
            className="w-full rounded-full bg-ink px-4 py-2 text-sm font-medium text-parchment transition hover:bg-ink/90"
          >
            {sprintLabel}
          </button>
          <button
            type="button"
            onClick={resetSprint}
            className="inline-flex items-center gap-2 text-xs text-ink/50 transition hover:text-ink/80"
          >
            <TimerReset className="h-3.5 w-3.5" />
            Reset 20 min
          </button>
        </div>
      </div>
    </aside>
  );
}
