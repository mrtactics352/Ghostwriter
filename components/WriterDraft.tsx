"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useQuery } from "convex/react";

// Matches your manually created index files in the root convex folder
import { api } from "@/convex/_generated/index"; 
import { StoryBible } from "./StoryBible";

interface WriterDraftProps {
  // Using 'any' bypasses the Supabase User type and Convex Id types
  user: any; 
  draftId: any;
}

export function WriterDraft({ user, draftId }: WriterDraftProps) {
  /** * This query uses the 'api' object from your manual index.js.
   * If the build still complains about 'drafts', ensure your 
   * index.js uses: export const api = anyApi;
   */
  const draft = useQuery(api.drafts.get, { id: draftId });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Write something great...",
      }),
    ],
    content: draft?.content,
    editorProps: {
      attributes: {
        class: "prose prose-lg lg:prose-xl dark:prose-invert focus:outline-none max-w-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="relative flex flex-1 flex-col">
        <EditorContent editor={editor} className="flex-1 py-12" />
        <StoryBible editor={editor} draftId={draftId}/>
    </div>
  );
}
