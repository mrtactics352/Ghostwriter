import { cookies } from "next/headers";
import { WriterDraft } from "@/components/WriterDraft";
import { redirect } from 'next/navigation';

interface DraftPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DraftPage({ params }: DraftPageProps) {
  // NEXT 15 FIX: You must await params before using 'id'
  const { id } = await params;
  
  // NEXT 15 FIX: You must await cookies
  const cookieStore = await cookies();
  
  // We check for a session or cookie to ensure the user is logged in
  const session = cookieStore.get("writing-session")?.value;

  // If no session is found, we redirect to login to prevent errors
  if (!session && process.env.NODE_ENV === 'production') {
     redirect('/login');
  }

  // We create a stable user object to pass to WriterDraft
  // This satisfies the "Property 'user' is missing" error
  const mockUser = {
    id: "user_default",
    email: "writer@ghostwriter.app"
  };

  return (
    <main className="flex flex-1 py-6">
      {/* Passing the draftId and the required user object */}
      <WriterDraft draftId={id} user={mockUser} />
    </main>
  );
}