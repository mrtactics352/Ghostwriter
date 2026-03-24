"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useQuery } from "convex/react";

// This matches your new "index" naming convention
import { api } from "@/convex/_generated/index"; 
import { StoryBible } from "./StoryBible";

interface WriterDraftProps {
  user: any; 
  draftId: any;
}

export function WriterDraft({ user, draftId }: WriterDraftProps) {
  // Uses the 'api' object from your renamed index.js file
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
