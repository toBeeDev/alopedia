-- Counter RPC functions for atomic increment/decrement

CREATE OR REPLACE FUNCTION increment_vote_count_post(p_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE posts SET vote_count = vote_count + 1 WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION decrement_vote_count_post(p_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE posts SET vote_count = GREATEST(0, vote_count - 1) WHERE id = p_id;
$$;

CREATE OR REPLACE FUNCTION increment_vote_count_comment(c_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE comments SET vote_count = vote_count + 1 WHERE id = c_id;
$$;

CREATE OR REPLACE FUNCTION decrement_vote_count_comment(c_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE comments SET vote_count = GREATEST(0, vote_count - 1) WHERE id = c_id;
$$;

CREATE OR REPLACE FUNCTION increment_comment_count(post_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE posts SET comment_count = comment_count + 1 WHERE id = post_id;
$$;
