import { WriterDraft } from "@/components/WriterDraft";

interface DraftPageProps {
  params: Promise<{ id: string }>;
}

export default async function DraftPage({ params }: DraftPageProps) {
  // NEXT 15 FIX: Must await params
  const { id } = await params;
  
  // Minimal user object to satisfy the WriterDraft prop requirements
  const mockUser = {
    id: "default_user",
    email: "writer@ghostwriter.app"
  };

  return (
    <main className="flex flex-1 py-6">
      <WriterDraft draftId={id} user={mockUser} />
    </main>
  );
}
