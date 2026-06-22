
CREATE OR REPLACE FUNCTION public.prevent_subscription_plan_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.subscription_plan IS DISTINCT FROM OLD.subscription_plan
     AND current_setting('role', true) <> 'service_role' THEN
    RAISE EXCEPTION 'subscription_plan cannot be modified by users';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_block_plan_change ON public.profiles;
CREATE TRIGGER profiles_block_plan_change
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_subscription_plan_change();
