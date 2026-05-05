
-- Guard: prevent deletion of the protected admin profile
CREATE OR REPLACE FUNCTION public.protect_admin_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    IF OLD.email = 'admin@nethost.space' THEN
      RAISE EXCEPTION 'Protected admin account cannot be deleted';
    END IF;
    RETURN OLD;
  END IF;
  IF (TG_OP = 'UPDATE') THEN
    IF OLD.email = 'admin@nethost.space' AND NEW.email <> OLD.email THEN
      RAISE EXCEPTION 'Protected admin email cannot be changed';
    END IF;
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_admin_profile_trg ON public.profiles;
CREATE TRIGGER protect_admin_profile_trg
BEFORE UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_admin_profile();

-- Guard: prevent removal of the protected admin's admin role
CREATE OR REPLACE FUNCTION public.protect_admin_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_email text;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    SELECT email INTO target_email FROM public.profiles WHERE id = OLD.user_id;
    IF target_email = 'admin@nethost.space' AND OLD.role = 'admin' THEN
      RAISE EXCEPTION 'Protected admin role cannot be revoked';
    END IF;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_admin_role_trg ON public.user_roles;
CREATE TRIGGER protect_admin_role_trg
BEFORE DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.protect_admin_role();
