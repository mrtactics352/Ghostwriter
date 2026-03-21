"use client";

import { useEffect, useMemo, useState } from "react";

const DAILY_GOAL = 1667;
const LEVEL_XP_STEP = 100;
const STORAGE_KEY = "ghostwriter:daily-stats";

type DailyStatsStore = {
  days: Record<string, number>;
};

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftDate(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function readDailyStats(): DailyStatsStore {
  if (typeof window === "undefined") {
    return { days: {} };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { days: {} };
    }

    return JSON.parse(raw) as DailyStatsStore;
  } catch {
    return { days: {} };
  }
}

function writeDailyStats(store: DailyStatsStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function countStreak(days: Record<string, number>, today: Date) {
  let streak = 0;
  let cursor = today;

  while ((days[getDateKey(cursor)] ?? 0) > 0) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }

  return streak;
}

export function useWriterStats(wordCount: number, bonusXp = 0) {
  const [todayWords, setTodayWords] = useState(wordCount);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    const today = new Date();
    const todayKey = getDateKey(today);
    const store = readDailyStats();
    const nextTodayWords = Math.max(store.days[todayKey] ?? 0, wordCount);

    store.days[todayKey] = nextTodayWords;
    writeDailyStats(store);

    setTodayWords(nextTodayWords);
    setCurrentStreak(countStreak(store.days, today));
  }, [wordCount]);

  return useMemo(() => {
    const earnedXp = Math.round(wordCount / 10) + bonusXp;
    const level = Math.max(1, Math.floor(earnedXp / LEVEL_XP_STEP) + 1);
    const previousLevelXp = (level - 1) * LEVEL_XP_STEP;
    const nextLevelXp = level * LEVEL_XP_STEP;
    const xpIntoLevel = earnedXp - previousLevelXp;
    const levelProgress = Math.min(1, xpIntoLevel / LEVEL_XP_STEP);

    return {
      currentStreak,
      dailyGoal: DAILY_GOAL,
      dailyProgress: Math.min(1, todayWords / DAILY_GOAL),
      earnedXp,
      level,
      nextLevelXp,
      todayWords,
      wordCount,
      xpIntoLevel,
      levelProgress,
    };
  }, [bonusXp, currentStreak, todayWords, wordCount]);
}
