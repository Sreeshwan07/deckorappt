
-- ============================================================
-- Remove payments system & introduce approval workflow
-- ============================================================

-- 1) Drop payments table, trigger functions, and is_paid column
DROP TRIGGER IF EXISTS payments_force_defaults_trg ON public.payments;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP FUNCTION IF EXISTS public.payments_force_defaults();

DROP TRIGGER IF EXISTS presentations_protect_is_paid_trg ON public.presentations;
DROP FUNCTION IF EXISTS public.presentations_protect_is_paid();
ALTER TABLE public.presentations DROP COLUMN IF EXISTS is_paid;

-- 2) User status enum
DO $$ BEGIN
  CREATE TYPE public.user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Profiles table (user status + email cache)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status public.user_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4) Super admin email config (single-row settings table)
CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_config TO authenticated;
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone authenticated can read config" ON public.app_config;
CREATE POLICY "Anyone authenticated can read config" ON public.app_config
FOR SELECT TO authenticated USING (true);

-- Seed super admin email (overwritable later from the admin UI / SQL)
INSERT INTO public.app_config (key, value)
VALUES ('super_admin_email', 'mdr.gemini@gmail.com')
ON CONFLICT (key) DO NOTHING;

-- 5) Helper: is_super_admin_email
CREATE OR REPLACE FUNCTION public.is_super_admin_email(_email TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.app_config
    WHERE key = 'super_admin_email' AND lower(value) = lower(_email)
  );
$$;

-- 6) Helper: get current user's status (security definer to bypass RLS recursion)
CREATE OR REPLACE FUNCTION public.get_user_status(_user_id UUID)
RETURNS public.user_status LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT status FROM public.profiles WHERE id = _user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_approved(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _user_id AND status = 'approved'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_approved(UUID) TO authenticated;

-- 7) Auto-create profile on user signup; auto-approve & grant admin role
--    to the configured super admin email.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_is_super BOOLEAN;
BEGIN
  v_is_super := public.is_super_admin_email(NEW.email);

  INSERT INTO public.profiles (id, email, status)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN v_is_super THEN 'approved'::public.user_status ELSE 'pending'::public.user_status END
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        status = CASE WHEN v_is_super THEN 'approved'::public.user_status ELSE public.profiles.status END;

  IF v_is_super THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8) Backfill profiles for existing users (approve all existing users so we don't lock them out)
INSERT INTO public.profiles (id, email, status)
SELECT u.id, u.email, 'approved'::public.user_status
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Ensure super admin exists & is admin if already signed up
UPDATE public.profiles p
SET status = 'approved'
WHERE public.is_super_admin_email(p.email);

INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'::public.app_role
FROM public.profiles p
WHERE public.is_super_admin_email(p.email)
ON CONFLICT (user_id, role) DO NOTHING;

-- 9) updated_at trigger for profiles
DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10) Profile RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated USING (id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Users can never insert/delete profiles directly (trigger handles inserts)
DROP POLICY IF EXISTS "No user inserts on profiles" ON public.profiles;
CREATE POLICY "No user inserts on profiles" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "No user deletes on profiles" ON public.profiles;
CREATE POLICY "No user deletes on profiles" ON public.profiles
FOR DELETE TO authenticated USING (false);

-- 11) Gate presentations & slides on approved status
-- Presentations: only approved users (or admins) can create/edit their own
DROP POLICY IF EXISTS "Users can view own presentations" ON public.presentations;
DROP POLICY IF EXISTS "Users can create own presentations" ON public.presentations;
DROP POLICY IF EXISTS "Users can update own presentations" ON public.presentations;
DROP POLICY IF EXISTS "Users can delete own presentations" ON public.presentations;

CREATE POLICY "Users can view own presentations" ON public.presentations
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Approved users can create presentations" ON public.presentations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND (public.is_approved(auth.uid()) OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Approved users can update own presentations" ON public.presentations
FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND (public.is_approved(auth.uid()) OR public.has_role(auth.uid(), 'admin')))
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own presentations" ON public.presentations
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Keep public shared presentations policy from earlier migration intact
-- (no-op here; that policy is unrelated to auth.uid)

-- Slides: only approved users (or admins) can create/edit slides for their decks
DROP POLICY IF EXISTS "Users can view slides of own presentations" ON public.slides;
DROP POLICY IF EXISTS "Users can create slides for own presentations" ON public.slides;
DROP POLICY IF EXISTS "Users can update slides of own presentations" ON public.slides;
DROP POLICY IF EXISTS "Users can delete slides of own presentations" ON public.slides;

CREATE POLICY "Users can view slides of own presentations" ON public.slides
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.presentations p WHERE p.id = slides.presentation_id AND p.user_id = auth.uid())
);

CREATE POLICY "Approved users can create slides" ON public.slides
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.presentations p WHERE p.id = slides.presentation_id AND p.user_id = auth.uid())
  AND (public.is_approved(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Approved users can update slides" ON public.slides
FOR UPDATE TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.presentations p WHERE p.id = slides.presentation_id AND p.user_id = auth.uid())
  AND (public.is_approved(auth.uid()) OR public.has_role(auth.uid(), 'admin'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.presentations p WHERE p.id = slides.presentation_id AND p.user_id = auth.uid())
);

CREATE POLICY "Users can delete slides of own presentations" ON public.slides
FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.presentations p WHERE p.id = slides.presentation_id AND p.user_id = auth.uid())
);
