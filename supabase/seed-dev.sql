-- ============================================================
-- Alopedia Development Environment — Full Schema Setup
-- Supabase SQL Editor에서 한 번에 실행
-- ============================================================

-- 1. Core Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nickname TEXT UNIQUE NOT NULL,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  streak_current INTEGER DEFAULT 0,
  streak_best INTEGER DEFAULT 0,
  avatar_seed TEXT,
  role TEXT DEFAULT 'user',
  last_check_in TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  images JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  is_public BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans ON DELETE CASCADE NOT NULL,
  norwood_grade INTEGER CHECK (norwood_grade BETWEEN 1 AND 5),
  score DECIMAL(4,1),
  details JSONB NOT NULL DEFAULT '{}',
  gemini_raw_response JSONB,
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  started_at DATE,
  ended_at DATE,
  dosage TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  board TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  images JSONB,
  scan_id UUID REFERENCES scans,
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_adopted BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  delete_pin TEXT,
  norwood_grade SMALLINT,
  score NUMERIC(5,2),
  slug TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT posts_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES profiles(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_unique ON posts (slug) WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  parent_id UUID REFERENCES comments,
  content TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  CONSTRAINT comments_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  vote_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  badge_code TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_code)
);

-- 2. RLS Policies
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Scans
CREATE POLICY "Users can view own scans" ON scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans" ON scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own scans" ON scans FOR UPDATE USING (auth.uid() = user_id);

-- Analyses (via scan ownership)
CREATE POLICY "Users can view own analyses" ON analyses FOR SELECT
  USING (EXISTS (SELECT 1 FROM scans WHERE scans.id = analyses.scan_id AND scans.user_id = auth.uid()));
CREATE POLICY "Users can insert own analyses" ON analyses FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM scans WHERE scans.id = analyses.scan_id AND scans.user_id = auth.uid()));

-- Posts (public read, own write)
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any post" ON posts FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update any post" ON posts FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Comments (public read, own write)
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete any comment" ON comments FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Admins can update any comment" ON comments FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Votes
CREATE POLICY "Users can view own votes" ON votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Achievements
CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Storage Bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('scans', 'scans', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'scans');
CREATE POLICY "Auth insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'scans' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'scans' AND auth.uid() IS NOT NULL);
CREATE POLICY "Auth delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'scans' AND auth.uid() IS NOT NULL);

-- 4. Auto-create profile on signup (trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_seed)
  VALUES (
    NEW.id,
    '익명_' || LEFT(NEW.id::text, 8),
    NEW.id::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
