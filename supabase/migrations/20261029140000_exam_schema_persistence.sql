-- Sponsor-backed property listing and inquiry subsystem.
-- Apply as one versioned migration to a Supabase PostgreSQL project.

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'property_owner', 'sponsor', 'public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 2),
  tier TEXT NOT NULL CHECK (tier IN ('gold', 'silver', 'bronze')),
  active_status BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  address TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  bathrooms NUMERIC(3, 1) NOT NULL CHECK (bathrooms >= 0),
  square_feet INTEGER NOT NULL CHECK (square_feet > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE public.property_sponsors (
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES public.sponsors(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, sponsor_id)
);

CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  inquirer_email TEXT NOT NULL CHECK (inquirer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  message TEXT NOT NULL CHECK (char_length(message) >= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX properties_owner_id_idx ON public.properties(owner_id);
CREATE INDEX properties_status_idx ON public.properties(status);
CREATE INDEX inquiries_property_id_idx ON public.inquiries(property_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER avoids recursive profile-policy evaluation. Only a database
-- administrator can create an admin profile; clients cannot change their role.
CREATE SCHEMA IF NOT EXISTS private;
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;

CREATE POLICY profiles_self_read ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));
CREATE POLICY profiles_admin_all ON public.profiles FOR ALL TO authenticated
  USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY sponsors_public_read ON public.sponsors FOR SELECT TO anon, authenticated
  USING (active_status = true);
CREATE POLICY sponsors_admin_all ON public.sponsors FOR ALL TO authenticated
  USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY properties_public_read ON public.properties FOR SELECT TO anon, authenticated
  USING (status = 'approved');
CREATE POLICY properties_owner_read ON public.properties FOR SELECT TO authenticated
  USING (owner_id = (SELECT auth.uid()));
CREATE POLICY properties_owner_insert ON public.properties FOR INSERT TO authenticated
  WITH CHECK (owner_id = (SELECT auth.uid()) AND status = 'draft'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'property_owner'));
CREATE POLICY properties_owner_update ON public.properties FOR UPDATE TO authenticated
  USING (owner_id = (SELECT auth.uid()) AND status IN ('draft', 'rejected'))
  WITH CHECK (owner_id = (SELECT auth.uid()) AND status IN ('draft', 'rejected'));
CREATE POLICY properties_owner_delete ON public.properties FOR DELETE TO authenticated
  USING (owner_id = (SELECT auth.uid()) AND status IN ('draft', 'rejected'));
CREATE POLICY properties_admin_all ON public.properties FOR ALL TO authenticated
  USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY property_sponsors_public_read ON public.property_sponsors FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.status = 'approved')
    AND EXISTS (SELECT 1 FROM public.sponsors s WHERE s.id = sponsor_id AND s.active_status = true));
CREATE POLICY property_sponsors_admin_all ON public.property_sponsors FOR ALL TO authenticated
  USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

CREATE POLICY inquiries_public_insert ON public.inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.status = 'approved'));
CREATE POLICY inquiries_owner_read ON public.inquiries FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.owner_id = (SELECT auth.uid())));
CREATE POLICY inquiries_admin_all ON public.inquiries FOR ALL TO authenticated
  USING ((SELECT private.is_admin())) WITH CHECK ((SELECT private.is_admin()));

GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.sponsors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sponsors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT SELECT ON public.properties TO anon;
GRANT SELECT ON public.property_sponsors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.property_sponsors TO authenticated;
GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
