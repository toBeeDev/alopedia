CREATE TABLE monthly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_month TEXT NOT NULL,
  data JSONB NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, report_month)
);

ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own reports" ON monthly_reports
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own reports" ON monthly_reports
  FOR UPDATE USING (user_id = auth.uid());
