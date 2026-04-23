CREATE TABLE IF NOT EXISTS public.usage_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    hint_level INTEGER DEFAULT 0,
    is_pro BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own usage"
    ON public.usage_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_usage_log_user ON public.usage_log(user_id);
