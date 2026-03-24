
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { WriterDraft } from "@/components/WriterDraft";
import { redirect } from 'next/navigation';

interface DraftPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DraftPage({ params }: DraftPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
          cookies: {
              get(name: string) {
                  return cookieStore.get(name)?.value;
              },
          },
      }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // In a real app, you'd likely redirect to a login page
    redirect('/login');
  }

  return (
    <main className="flex flex-1 py-6">
      <WriterDraft draftId={id} user={user} />
    </main>
  );
}
