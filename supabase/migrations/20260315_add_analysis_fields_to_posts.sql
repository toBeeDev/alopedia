-- Add analysis fields to posts for shared scan results
ALTER TABLE posts ADD COLUMN IF NOT EXISTS norwood_grade smallint;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS score numeric(5,2);
