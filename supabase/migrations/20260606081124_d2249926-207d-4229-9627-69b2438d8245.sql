
-- 1) Lock down user_roles: explicit deny for all non-admin write operations
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon, authenticated, PUBLIC;

CREATE POLICY "Only admins can insert user roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update user roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete user roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2) Restrict payments policies to authenticated role only (defence in depth)
DROP POLICY IF EXISTS "Users can create own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

CREATE POLICY "Users can create own payments"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own payments"
ON public.payments FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Explicitly block user updates/deletes on payments (only service_role can modify)
CREATE POLICY "No user updates on payments"
ON public.payments FOR UPDATE TO authenticated
USING (false) WITH CHECK (false);

CREATE POLICY "No user deletes on payments"
ON public.payments FOR DELETE TO authenticated
USING (false);

-- 3) Restrict presentations/slides policies to authenticated role
DROP POLICY IF EXISTS "Users can create own presentations" ON public.presentations;
DROP POLICY IF EXISTS "Users can view own presentations" ON public.presentations;
DROP POLICY IF EXISTS "Users can update own presentations" ON public.presentations;
DROP POLICY IF EXISTS "Users can delete own presentations" ON public.presentations;

CREATE POLICY "Users can create own presentations" ON public.presentations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own presentations" ON public.presentations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own presentations" ON public.presentations FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own presentations" ON public.presentations FOR DELETE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own slides" ON public.slides;
DROP POLICY IF EXISTS "Users can view own slides" ON public.slides;
DROP POLICY IF EXISTS "Users can update own slides" ON public.slides;
DROP POLICY IF EXISTS "Users can delete own slides" ON public.slides;

CREATE POLICY "Users can create own slides" ON public.slides FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.presentations p WHERE p.id = slides.presentation_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can view own slides" ON public.slides FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.presentations p WHERE p.id = slides.presentation_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can update own slides" ON public.slides FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.presentations p WHERE p.id = slides.presentation_id AND p.user_id = auth.uid()));
CREATE POLICY "Users can delete own slides" ON public.slides FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.presentations p WHERE p.id = slides.presentation_id AND p.user_id = auth.uid()));

-- 4) Revoke EXECUTE on internal SECURITY DEFINER trigger/util functions from anon and authenticated
REVOKE EXECUTE ON FUNCTION public.payments_force_defaults() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.presentations_protect_is_paid() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
-- has_role is used inside RLS policies, keep executable for authenticated but revoke from anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
