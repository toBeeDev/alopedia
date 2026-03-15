-- Add slug column to posts for SEO-friendly URLs
ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug text;

-- Unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique ON posts (slug) WHERE slug IS NOT NULL;

-- Backfill existing posts: use id as temporary slug
UPDATE posts SET slug = id::text WHERE slug IS NULL;
