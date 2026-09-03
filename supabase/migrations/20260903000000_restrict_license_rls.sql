-- The original "Anyone can read licenses by key" policy (USING (true)) let anyone
-- holding the public anon key dump the entire licenses table — every user's
-- license_key, email, and plan — not just look up the one key they had.
--
-- Unauthenticated license-key redemption now goes through the validate-license
-- Edge Function (service-role lookup, returns only {valid, plan, expires_at}),
-- so direct table reads no longer need to be open to anon.

DROP POLICY IF EXISTS "Anyone can read licenses by key" ON public.licenses;

-- Authenticated users can read their own license rows (by user_id, or by email
-- for accounts where a license was issued before user_id was linked).
CREATE POLICY "Users read own licenses"
    ON public.licenses FOR SELECT
    USING (
        auth.uid() = user_id
        OR auth.jwt() ->> 'email' = email
    );
