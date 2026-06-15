
ALTER TABLE public.presentations
  ADD COLUMN IF NOT EXISTS share_token text UNIQUE,
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

-- Public read of presentations that are explicitly shared
DROP POLICY IF EXISTS "Public can view shared presentations" ON public.presentations;
CREATE POLICY "Public can view shared presentations"
  ON public.presentations FOR SELECT
  TO anon, authenticated
  USING (is_public = true AND share_token IS NOT NULL);

-- Public read of slides belonging to publicly-shared presentations
DROP POLICY IF EXISTS "Public can view slides of shared presentations" ON public.slides;
CREATE POLICY "Public can view slides of shared presentations"
  ON public.slides FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.presentations p
    WHERE p.id = slides.presentation_id
      AND p.is_public = true
      AND p.share_token IS NOT NULL
  ));

GRANT SELECT ON public.presentations TO anon;
GRANT SELECT ON public.slides TO anon;
