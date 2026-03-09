-- ScalpCheck Initial Schema
-- All tables have RLS enabled with proper policies

-- ═══════════════════════════════════════════
-- 1. PROFILES
-- ═══════════════════════════════════════════
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nickname TEXT UNIQUE NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  exp INTEGER DEFAULT 0 NOT NULL,
  streak_current INTEGER DEFAULT 0 NOT NULL,
  streak_best INTEGER DEFAULT 0 NOT NULL,
  avatar_seed TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 본인 프로필 전체 접근
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- 다른 유저 공개 필드 (닉네임, 레벨, 뱃지용)
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profiles_delete_own"
  ON profiles FOR DELETE
  USING (id = auth.uid());

-- ═══════════════════════════════════════════
-- 2. SCANS
-- ═══════════════════════════════════════════
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending' NOT NULL
    CHECK (status IN ('pending', 'analyzing', 'completed', 'failed')),
  is_public BOOLEAN DEFAULT false NOT NULL
);

CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scans_select_own"
  ON scans FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "scans_insert_own"
  ON scans FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "scans_update_own"
  ON scans FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "scans_delete_own"
  ON scans FOR DELETE
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════
-- 3. ANALYSES
-- ═══════════════════════════════════════════
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID REFERENCES scans ON DELETE CASCADE NOT NULL,
  norwood_grade INTEGER NOT NULL CHECK (norwood_grade BETWEEN 1 AND 5),
  score DECIMAL(4,1) NOT NULL CHECK (score BETWEEN 0.0 AND 100.0),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  gemini_raw_response JSONB,
  model_version TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_analyses_scan_id ON analyses(scan_id);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- 본인 스캔의 분석만 조회 가능
CREATE POLICY "analyses_select_own"
  ON analyses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM scans
      WHERE scans.id = analyses.scan_id
        AND scans.user_id = auth.uid()
    )
  );

-- INSERT는 서버(service_role)만 — 클라이언트에서 직접 삽입 불가
CREATE POLICY "analyses_insert_service"
  ON analyses FOR INSERT
  WITH CHECK (false);

-- DELETE는 본인 스캔의 분석만
CREATE POLICY "analyses_delete_own"
  ON analyses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM scans
      WHERE scans.id = analyses.scan_id
        AND scans.user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════
-- 4. TREATMENTS
-- ═══════════════════════════════════════════
CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('medication', 'procedure', 'supplement', 'shampoo')),
  name TEXT NOT NULL,
  started_at DATE,
  ended_at DATE,
  dosage TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL
);

CREATE INDEX idx_treatments_user_id ON treatments(user_id);

ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "treatments_select_own"
  ON treatments FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "treatments_insert_own"
  ON treatments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "treatments_update_own"
  ON treatments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "treatments_delete_own"
  ON treatments FOR DELETE
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════
-- 5. POSTS
-- ═══════════════════════════════════════════
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  board TEXT NOT NULL
    CHECK (board IN ('medication_review', 'procedure_review', 'qna', 'lounge')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  images JSONB,
  scan_id UUID REFERENCES scans ON DELETE SET NULL,
  vote_count INTEGER DEFAULT 0 NOT NULL,
  comment_count INTEGER DEFAULT 0 NOT NULL,
  is_adopted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_posts_board ON posts(board);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 모든 인증 유저가 조회 가능 (공개 게시판)
CREATE POLICY "posts_select_all"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "posts_insert_auth"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "posts_update_own"
  ON posts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "posts_delete_own"
  ON posts FOR DELETE
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════
-- 6. COMMENTS
-- ═══════════════════════════════════════════
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES comments ON DELETE CASCADE,
  content TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_all"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "comments_insert_auth"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "comments_update_own"
  ON comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "comments_delete_own"
  ON comments FOR DELETE
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════
-- 7. VOTES
-- ═══════════════════════════════════════════
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment', 'scan')),
  target_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'empathy')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX idx_votes_target ON votes(target_type, target_id);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "votes_select_own"
  ON votes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "votes_insert_auth"
  ON votes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "votes_delete_own"
  ON votes FOR DELETE
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════
-- 8. ACHIEVEMENTS
-- ═══════════════════════════════════════════
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  badge_code TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, badge_code)
);

CREATE INDEX idx_achievements_user_id ON achievements(user_id);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements_select_own"
  ON achievements FOR SELECT
  USING (user_id = auth.uid());

-- INSERT는 서버(service_role)만
CREATE POLICY "achievements_insert_service"
  ON achievements FOR INSERT
  WITH CHECK (false);

-- ═══════════════════════════════════════════
-- 9. AUTO PROFILE CREATION ON SIGNUP
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, avatar_seed)
  VALUES (
    NEW.id,
    '두피전사_' || substr(NEW.id::text, 1, 6),
    substr(md5(NEW.id::text), 1, 8)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════
-- 10. STORAGE BUCKET
-- ═══════════════════════════════════════════
-- Run via Supabase Dashboard or CLI:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('scans', 'scans', false);
--
-- Storage RLS:
-- SELECT: owner = auth.uid()
-- INSERT: owner = auth.uid() AND bucket_id = 'scans'
-- DELETE: owner = auth.uid()
