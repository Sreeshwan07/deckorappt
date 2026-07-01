
-- Restrict app_config to admins only
DROP POLICY IF EXISTS "Authenticated users can view app_config" ON public.app_config;
DROP POLICY IF EXISTS "Anyone can view app_config" ON public.app_config;
DROP POLICY IF EXISTS "Users can view app_config" ON public.app_config;

CREATE POLICY "Admins can view app_config"
ON public.app_config
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Remove duplicate slides INSERT policy that bypasses approval gate
DROP POLICY IF EXISTS "Users can create own slides" ON public.slides;
