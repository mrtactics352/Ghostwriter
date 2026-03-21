import { WriterDraft } from "@/components/WriterDraft";

interface DraftPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DraftPage({ params }: DraftPageProps) {
  const { id } = await params;

  return (
    <main className="flex flex-1 py-6">
      <WriterDraft draftId={id} />
    </main>
  );
}
