-- ============================================================
-- Hair Diary Migration
-- - Add diary_entries and diary_checklists tables
-- - Add diary_premium_until and terms_agreed_at to profiles
-- - Update handle_new_user() for 30-day premium trial
-- - Drop board tables: votes, comments, posts
-- ============================================================

-- 1. Add columns to profiles
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS diary_premium_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS terms_agreed_at TIMESTAMPTZ;

-- 2. Create diary_entries table
-- ============================================================

CREATE TABLE diary_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  scan_id UUID REFERENCES scans,
  date DATE NOT NULL,
  memo TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_photo_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT diary_entries_user_date_unique UNIQUE (user_id, date)
);

CREATE INDEX idx_diary_entries_user_id ON diary_entries (user_id);
CREATE INDEX idx_diary_entries_date ON diary_entries (user_id, date);
CREATE INDEX idx_diary_entries_public ON diary_entries (is_public) WHERE is_public = true;

-- 3. Create diary_checklists table
-- ============================================================

CREATE TABLE diary_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES diary_entries ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('medication', 'treatment', 'lifestyle')),
  item TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_diary_checklists_entry ON diary_checklists (entry_id);

-- 4. RLS for diary_entries
-- ============================================================

ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diary_entries_select" ON diary_entries
  FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "diary_entries_insert" ON diary_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "diary_entries_update" ON diary_entries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "diary_entries_delete" ON diary_entries
  FOR DELETE USING (user_id = auth.uid());

-- 5. RLS for diary_checklists (via entry ownership)
-- ============================================================

ALTER TABLE diary_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diary_checklists_select" ON diary_checklists
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diary_entries
      WHERE diary_entries.id = diary_checklists.entry_id
        AND (diary_entries.user_id = auth.uid() OR diary_entries.is_public = true)
    )
  );

CREATE POLICY "diary_checklists_insert" ON diary_checklists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM diary_entries
      WHERE diary_entries.id = diary_checklists.entry_id
        AND diary_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "diary_checklists_update" ON diary_checklists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM diary_entries
      WHERE diary_entries.id = diary_checklists.entry_id
        AND diary_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "diary_checklists_delete" ON diary_checklists
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM diary_entries
      WHERE diary_entries.id = diary_checklists.entry_id
        AND diary_entries.user_id = auth.uid()
    )
  );

-- 6. Update handle_new_user() to set diary_premium_until
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_seed, diary_premium_until)
  VALUES (
    NEW.id,
    '익명독수리_' || LEFT(NEW.id::text, 8),
    NEW.id::text,
    now() + INTERVAL '30 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Drop board tables (CASCADE handles FK dependencies)
-- ============================================================

DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
