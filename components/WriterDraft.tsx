'use client';

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Howl } from "howler";
import { AlertCircle, Check, CloudOff, Focus, LoaderCircle, Save, Volume2, VolumeX, Palette } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { saveDraft } from "@/app/actions/saveDraft";
import { ProgressGlow } from "@/components/ProgressGlow";
import { ZenSidebar } from "@/components/ZenSidebar";
import { useWriterStats } from "@/hooks/useWriterStats";
import { createEmptyDocument, isUuid } from "@/lib/editor";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { PDFDownloadLink } from "@react-pdf/renderer";
import StoryDocument from "@/components/StoryDocument";
import CoverDesigner from "@/components/CoverDesigner";

type DraftRecord = {
  body: Record<string, unknown>;
  current_word_count: number;
  id: string;
  title: string;
  total_words_aim: number | null;
};

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  userId: string;
};

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getCacheKey(draftId: string) {
  return `ghostwriter:draft:${draftId}`;
}

export function WriterDraft({ draftId }: { draftId: string }) {
  const [title, setTitle] = useState("Untitled draft");
  const [bodyJson, setBodyJson] = useState<Record<string, unknown>>(createEmptyDocument());
  const [wordCount, setWordCount] = useState(0);
  const [dailyBonusXp, setDailyBonusXp] = useState(0);
  const [hasSelection, setHasSelection] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "offline" | "auth" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftRecord | null>(null);
  const [sessionTokens, setSessionTokens] = useState<SessionTokens | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [focusFlash, setFocusFlash] = useState(false);
  const [coverDesign, setCoverDesign] = useState<any>(null);
  const [showCoverDesigner, setShowCoverDesigner] = useState(false);
  const clickSoundRef = useRef<Howl | null>(null);
  const lastTypedAt = useRef(Date.now());
  const hydratedDraftRef = useRef<string | null>(null);

  const stats = useWriterStats(wordCount, dailyBonusXp);

  useEffect(() => {
    clickSoundRef.current = new Howl({
      src: ["/sounds/typewriter-click.wav"],
      html5: false,
      preload: true,
      volume: 0.18,
    });

    return () => {
      clickSoundRef.current?.unload();
    };
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class:
          "prose prose-lg prose-neutral max-w-none min-h-[60vh] bg-transparent font-serif text-xl leading-10 text-ink outline-none",
      },
    },
    content: createEmptyDocument(),
    onCreate: ({ editor: currentEditor }) => {
      setWordCount(countWords(currentEditor.getText()));
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      setHasSelection(!currentEditor.state.selection.empty);
    },
    onUpdate: ({ editor: currentEditor }) => {
      const nextBody = currentEditor.getJSON() as Record<string, unknown>;
      const nextWordCount = countWords(currentEditor.getText());

      setBodyJson(nextBody);
      setWordCount(nextWordCount);
      setIsDirty(true);
      setSaveState("idle");
      lastTypedAt.current = Date.now();
      setIsIdle(false);

      if (soundEnabled) {
        clickSoundRef.current?.play();
      }

      window.localStorage.setItem(
        getCacheKey(draftId),
        JSON.stringify({
          body: nextBody,
          title,
          updatedAt: new Date().toISOString(),
          wordCount: nextWordCount,
        }),
      );
    },
  });

  const loadDraft = useCallback(async () => {
    try {
      const cachedDraft = window.localStorage.getItem(getCacheKey(draftId));
      const parsedCache = cachedDraft
        ? (JSON.parse(cachedDraft) as { body: Record<string, unknown>; title?: string; wordCount?: number })
        : null;

      if (!isUuid(draftId)) {
        setSessionTokens(null);
        setDraft({
          body: parsedCache?.body ?? createEmptyDocument(),
          current_word_count: parsedCache?.wordCount ?? 0,
          id: draftId,
          title: parsedCache?.title ?? "Offline draft",
          total_words_aim: 50000,
        });
        setTitle(parsedCache?.title ?? "Offline draft");
        setBodyJson(parsedCache?.body ?? createEmptyDocument());
        setWordCount(parsedCache?.wordCount ?? 0);
        setStatus("offline");
        return;
      }

      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setStatus("auth");
        return;
      }

      setSessionTokens({
        accessToken: session.access_token,
        refreshToken: session.refresh_token ?? session.access_token,
        userId: session.user.id,
      });

      const { data, error } = await supabase
        .from("drafts")
        .select("id, title, body, current_word_count, total_words_aim")
        .eq("id", draftId)
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        throw error;
      }

      const { data: savedCover } = await supabase
        .from('cover_designs')
        .select('*')
        .eq('draft_id', draftId)
        .single();
      
      if (savedCover) {
        setCoverDesign(savedCover);
      }

      const mergedBody = parsedCache?.body ?? data.body ?? createEmptyDocument();
      const mergedTitle = parsedCache?.title ?? data.title ?? "Untitled draft";
      const mergedWordCount = parsedCache?.wordCount ?? data.current_word_count ?? 0;

      setDraft({
        body: mergedBody,
        current_word_count: mergedWordCount,
        id: data.id,
        title: mergedTitle,
        total_words_aim: data.total_words_aim,
      });
      setTitle(mergedTitle);
      setBodyJson(mergedBody);
      setWordCount(mergedWordCount);
      setStatus("ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load draft.");
      setStatus("error");
    }
  }, [draftId]);

  useEffect(() => {
    void loadDraft();
  }, [loadDraft]);

  useEffect(() => {
    if (!editor || !draft || hydratedDraftRef.current === draft.id) {
      return;
    }

    editor.commands.setContent(draft.body);
    hydratedDraftRef.current = draft.id;
    setWordCount(draft.current_word_count || countWords(editor.getText()));
    setTitle(draft.title);
  }, [draft, editor]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setIsIdle(Date.now() - lastTypedAt.current >= 30000 && wordCount > 0);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [wordCount]);

  useEffect(() => {
    if (!isDirty || !sessionTokens || status !== "ready") {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        setSaveState("saving");
        const result = await saveDraft({
          accessToken: sessionTokens.accessToken,
          refreshToken: sessionTokens.refreshToken,
          body: bodyJson,
          currentStreak: stats.currentStreak,
          draftId,
          earnedXp: stats.earnedXp,
          level: stats.level,
          title,
          todayWords: stats.todayWords,
          wordCount,
        });
        setLastSavedAt(result.updated_at as string);
        setSaveState("saved");
        setIsDirty(false);
      } catch (error) {
        setSaveState("error");
        setErrorMessage(error instanceof Error ? error.message : "Auto-save failed.");
      }
    }, 30000);

    return () => window.clearTimeout(timeout);
  }, [bodyJson, draftId, isDirty, sessionTokens, stats.currentStreak, stats.earnedXp, stats.level, stats.todayWords, status, title, wordCount]);

  useEffect(() => {
    if (!focusFlash) {
      return;
    }

    const timeout = window.setTimeout(() => setFocusFlash(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [focusFlash]);

  const saveLabel = useMemo(() => {
    if (status === "offline") {
      return "Local backup only";
    }

    switch (saveState) {
      case "saving":
        return "Saving…";
      case "saved":
        return lastSavedAt
          ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
          : "Saved";
      case "error":
        return "Save failed";
      default:
        return isDirty ? "Changes pending" : "Synced";
    }
  }, [isDirty, lastSavedAt, saveState, status]);

  const runRefineBonus = () => {
    if (!editor || editor.state.selection.empty) {
      return;
    }

    setDailyBonusXp((value) => value + 10);
        setFocusFlash(true);
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-ink/60">
        <LoaderCircle className="mr-3 h-5 w-5 animate-spin" />
        Loading your draft…
      </div>
    );
  }

  if (status === "auth") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-5 text-center text-ink/70">
        <AlertCircle className="h-10 w-10 text-ember" />
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-ink">Sign in to open this draft.</h1>
          <p>Your real drafts are protected behind Supabase auth. Use the offline demo if you just want to test the editor shell.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/auth" className="rounded-full bg-ink px-5 py-3 text-sm font-medium text-parchment transition hover:bg-ink/90">
            Go to sign in
          </Link>
          <Link href="/drafts/demo" className="rounded-full bg-white/80 px-5 py-3 text-sm text-ink/65 shadow-sm transition hover:bg-white">
            Open demo draft
          </Link>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-4 text-center text-ink/70">
        <AlertCircle className="h-10 w-10 text-ember" />
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-ink">Unable to open this draft.</h1>
          <p>{errorMessage ?? "Check your Supabase credentials and draft permissions, then try again."}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ProgressGlow progress={stats.levelProgress} />
      <ZenSidebar currentStreak={stats.currentStreak} dailyGoal={stats.dailyGoal} todayWords={stats.todayWords} />

      {showCoverDesigner && <CoverDesigner draftId={draftId} initialCoverData={coverDesign} onClose={() => setShowCoverDesigner(false)} onSave={setCoverDesign} />}

      {(isIdle || focusFlash) && (
        <div className="pointer-events-none fixed inset-0 z-30">
          <div className={`absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-ember/35 to-transparent ${isIdle ? "animate-pulseEdge" : ""}`} />
          <div className={`absolute inset-y-0 right-0 w-3 bg-gradient-to-l from-ember/35 to-transparent ${isIdle ? "animate-pulseEdge" : ""}`} />
          <div className={`absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-ember/20 to-transparent ${focusFlash ? "animate-pulseEdge" : ""}`} />
        </div>
      )}

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 pb-32 pt-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-ink/35">
              {status === "offline" ? "Ghostwriter demo draft" : "Ghostwriter draft"}
            </p>
            <input
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setIsDirty(true);
              }}
              className="w-full bg-transparent font-serif text-4xl text-ink outline-none placeholder:text-ink/25"
              placeholder="Untitled story"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
            <button
              type="button"
              onClick={() => setSoundEnabled((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm transition hover:bg-white"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              Typewriter sound
            </button>
            <button
              type="button"
              onClick={runRefineBonus}
              disabled={!hasSelection}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-parchment transition enabled:hover:bg-ink/90 disabled:cursor-not-allowed disabled:bg-ink/25"
            >
              <Focus className="h-4 w-4" />
              Refine {hasSelection ? "+10 XP" : "(select text)"}
            </button>
            <button
              type="button"
              onClick={() => setShowCoverDesigner(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 shadow-sm transition hover:bg-white"
            >
              <Palette className="h-4 w-4" />
              Design Cover
            </button>
            <PDFDownloadLink
              document={<StoryDocument title={title} author={coverDesign?.author || 'Author Name'} content={editor?.getText() || ''} coverDesign={coverDesign} />}
              fileName={`${title.replace(/ /g, '_')}.pdf`}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-parchment transition enabled:hover:bg-ink/90"
            >
              {({ loading }) => (loading ? "Generating PDF..." : "Download Manuscript")}
            </PDFDownloadLink>
          </div>
        </header>

        <section className="rounded-[2rem] bg-white/60 px-6 py-8 shadow-ambient backdrop-blur sm:px-10">
          <EditorContent editor={editor} />
        </section>

        <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-parchment/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4 text-sm text-ink/65 sm:px-10">
            <div className="flex flex-wrap items-center gap-4">
              <span>{stats.wordCount.toLocaleString()} words</span>
              <span>{stats.earnedXp.toLocaleString()} XP</span>
              <span>Level {stats.level}</span>
              <span>
                {stats.todayWords.toLocaleString()} / {stats.dailyGoal.toLocaleString()} today
              </span>
              {draft?.total_words_aim ? <span>Aim {draft.total_words_aim.toLocaleString()}</span> : null}
            </div>

            <div className="flex items-center gap-2">
              {status === "offline" ? (
                <CloudOff className="h-4 w-4 text-ember" />
              ) : saveState === "saved" ? (
                <Check className="h-4 w-4 text-ink" />
              ) : saveState === "saving" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saveLabel}</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
