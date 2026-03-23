
CREATE TABLE IF NOT EXISTS public.story_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES public.drafts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('character', 'location', 'event', 'plot')),
  name TEXT NOT NULL,
  details JSONB,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- RLS Policies
ALTER TABLE public.story_elements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to manage their own story elements" 
ON public.story_elements
FOR ALL
TO authenticated
USING (user_id = auth.uid());
