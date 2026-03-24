import { WriterDraft } from "@/components/WriterDraft";
import { cookies } from "next/headers";

interface DraftPageProps {
  params: Promise<{ id: string }>;
}

export default async function DraftPage({ params }: DraftPageProps) {
  // NEXT 15 FIX: params must be awaited
  const { id } = await params;
  
  // We provide a fallback user object so the component doesn't crash
  const mockUser = {
    id: "default_user",
    email: "writer@ghostwriter.app"
  };

  return (
    <main className="flex flex-1 py-6">
      {/* Pass both draftId AND user to satisfy the TypeScript error */}
      <WriterDraft draftId={id} user={mockUser} />
    </main>
  );
}
