ALTER TABLE diary_entries
  ADD COLUMN IF NOT EXISTS slug TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_diary_entries_slug ON diary_entries (slug) WHERE slug IS NOT NULL;

NOTIFY pgrst, 'reload schema';
