
import Link from "next/link";
import { ArrowRight, NotebookPen } from "lucide-react";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col justify-between py-12">
      <section className="flex max-w-4xl flex-1 flex-col justify-center gap-10">
        <div className="space-y-5">
          <p className="text-sm uppercase tracking-[0.3em] text-ink/45">Ghostwriter</p>
          <h1 className="max-w-3xl font-serif text-5xl leading-tight text-ink sm:text-7xl">
            Story drafting with a calm editor, streaks that matter, and zero clutter.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-ink/70">
            Enter a distraction-light writing studio with autosave, instant local backups, progress glow, and a focused drafting rhythm designed for long-form fiction.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-parchment transition hover:bg-ink/90"
          >
            Launch your studio
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/drafts/demo"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-3 text-sm text-ink/60 shadow-sm transition hover:bg-white"
          >
            Try offline demo
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-3 text-sm text-ink/60 shadow-sm">
            <NotebookPen className="h-4 w-4" />
            Built for minimalist, high-performance story writing.
          </div>
        </div>
      </section>
    </main>
  );
}
