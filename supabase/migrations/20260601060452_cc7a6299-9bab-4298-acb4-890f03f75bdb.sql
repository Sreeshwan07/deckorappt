
-- 1) Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Seed admin for known account if it exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
WHERE lower(email) = 'mdr.gemini@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2) Payment integrity: force safe defaults on insert
CREATE OR REPLACE FUNCTION public.payments_force_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.status := 'pending';
  NEW.payment_provider_id := NULL;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS payments_force_defaults_trg ON public.payments;
CREATE TRIGGER payments_force_defaults_trg
BEFORE INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.payments_force_defaults();

-- 3) Presentations: prevent users from setting/changing is_paid
CREATE OR REPLACE FUNCTION public.presentations_protect_is_paid()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.is_paid := false;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.is_paid := OLD.is_paid;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS presentations_protect_is_paid_trg ON public.presentations;
CREATE TRIGGER presentations_protect_is_paid_trg
BEFORE INSERT OR UPDATE ON public.presentations
FOR EACH ROW EXECUTE FUNCTION public.presentations_protect_is_paid();
