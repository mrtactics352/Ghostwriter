"use client";

type ProgressGlowProps = {
  progress: number;
};

export function ProgressGlow({ progress }: ProgressGlowProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-px bg-ink/10">
      <div
        className="h-full bg-gradient-to-r from-glow via-ink to-glow transition-[width] duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
      />
    </div>
  );
}
