-- Add last_check_in column to profiles for streak tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_check_in timestamptz;
