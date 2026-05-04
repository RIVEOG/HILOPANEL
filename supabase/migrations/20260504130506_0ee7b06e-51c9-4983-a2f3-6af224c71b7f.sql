
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  pterodactyl_user_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by self or admin" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins manage profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + default resources + first user becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_first BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email
  );

  SELECT NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') INTO is_first;
  IF is_first THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;

  INSERT INTO public.user_resources (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Settings (single row)
CREATE TABLE public.settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  panel_name TEXT NOT NULL DEFAULT 'Hilos',
  panel_tagline TEXT DEFAULT 'Premium game & app hosting',
  pterodactyl_url TEXT,
  pterodactyl_api_key TEXT,
  stripe_secret_key TEXT,
  stripe_webhook_secret TEXT,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT,
  smtp_password TEXT,
  smtp_from TEXT,
  default_ram_mb INTEGER NOT NULL DEFAULT 1024,
  default_cpu_pct INTEGER NOT NULL DEFAULT 50,
  default_disk_mb INTEGER NOT NULL DEFAULT 5120,
  default_servers INTEGER NOT NULL DEFAULT 1,
  coins_per_minute INTEGER NOT NULL DEFAULT 1,
  cost_ram_per_gb INTEGER NOT NULL DEFAULT 100,
  cost_cpu_per_core INTEGER NOT NULL DEFAULT 200,
  cost_disk_per_gb INTEGER NOT NULL DEFAULT 50,
  cost_server_slot INTEGER NOT NULL DEFAULT 500,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT settings_singleton CHECK (id = 1)
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.settings (id) VALUES (1);

CREATE POLICY "Anyone authenticated can view settings" ON public.settings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins update settings" ON public.settings
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Plan type enum
CREATE TYPE public.plan_type AS ENUM ('MINECRAFT', 'PYTHON', 'NODEJS', 'VPS', 'OTHER');
CREATE TYPE public.payment_method AS ENUM ('stripe', 'discord');

-- Free plans
CREATE TABLE public.free_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type plan_type NOT NULL,
  egg_id INTEGER,
  ram_mb INTEGER NOT NULL,
  cpu_pct INTEGER NOT NULL,
  disk_mb INTEGER NOT NULL,
  time_period_seconds INTEGER NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.free_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read free plans" ON public.free_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage free plans" ON public.free_plans FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Paid plans
CREATE TABLE public.paid_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type plan_type NOT NULL,
  egg_id INTEGER,
  ram_mb INTEGER NOT NULL,
  cpu_pct INTEGER NOT NULL,
  disk_mb INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'stripe',
  discord_redirect TEXT,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.paid_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read paid plans" ON public.paid_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage paid plans" ON public.paid_plans FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Links
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read links" ON public.links FOR SELECT USING (true);
CREATE POLICY "Admins manage links" ON public.links FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- User resources
CREATE TABLE public.user_resources (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL DEFAULT 0,
  ram_mb INTEGER NOT NULL DEFAULT 1024,
  cpu_pct INTEGER NOT NULL DEFAULT 50,
  disk_mb INTEGER NOT NULL DEFAULT 5120,
  server_slots INTEGER NOT NULL DEFAULT 1,
  last_afk_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own resources" ON public.user_resources FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own resources" ON public.user_resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own resources" ON public.user_resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage resources" ON public.user_resources FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Servers
CREATE TABLE public.servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type plan_type NOT NULL,
  ram_mb INTEGER NOT NULL,
  cpu_pct INTEGER NOT NULL,
  disk_mb INTEGER NOT NULL,
  pterodactyl_server_id INTEGER,
  egg_id INTEGER,
  is_free BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  suspended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.servers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own servers" ON public.servers FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own servers" ON public.servers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own servers" ON public.servers FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage servers" ON public.servers FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Purchases
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paid_plan_id UUID REFERENCES public.paid_plans(id) ON DELETE SET NULL,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  amount_cents INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage purchases" ON public.purchases FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger after user_resources table exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
