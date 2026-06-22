ALTER POLICY trades_update_own ON public.trades
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

ALTER POLICY journal_update_own ON public.journal_entries
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Lock down profile updates: users cannot change their own subscription_plan
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND subscription_plan = (SELECT p.subscription_plan FROM public.profiles p WHERE p.id = auth.uid())
  );