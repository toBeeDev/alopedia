-- Add nickname_changed_at column for weekly nickname change limit
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nickname_changed_at TIMESTAMPTZ DEFAULT NULL;
