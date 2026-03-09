/** Supabase Database Types */

export type ScanStatus = "pending" | "analyzing" | "completed" | "failed";
export type BoardType = "medication_review" | "procedure_review" | "qna" | "lounge";
export type TreatmentType = "medication" | "procedure" | "supplement" | "shampoo";
export type VoteTargetType = "post" | "comment" | "scan";
export type VoteType = "up" | "empathy";

export interface Profile {
  id: string;
  nickname: string;
  level: number;
  exp: number;
  streakCurrent: number;
  streakBest: number;
  avatarSeed: string | null;
  createdAt: string;
}

export interface ScanImage {
  type: "top" | "front" | "side";
  url: string;
  thumbnailUrl: string;
}

export interface Scan {
  id: string;
  userId: string;
  createdAt: string;
  images: ScanImage[];
  status: ScanStatus;
  isPublic: boolean;
}

export interface AnalysisDetail {
  hairline: string;
  density: string;
  thickness: string;
  scalpCondition: string;
  advice: string;
}

export interface Analysis {
  id: string;
  scanId: string;
  norwoodGrade: number;
  score: number;
  details: AnalysisDetail;
  geminiRawResponse: Record<string, unknown> | null;
  modelVersion: string | null;
  createdAt: string;
}

export interface Treatment {
  id: string;
  userId: string;
  type: TreatmentType;
  name: string;
  startedAt: string | null;
  endedAt: string | null;
  dosage: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface Post {
  id: string;
  userId: string;
  board: BoardType;
  title: string;
  content: string;
  tags: string[];
  images: Record<string, unknown>[] | null;
  scanId: string | null;
  voteCount: number;
  commentCount: number;
  isAdopted: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  voteCount: number;
  createdAt: string;
}

export interface Vote {
  id: string;
  userId: string;
  targetType: VoteTargetType;
  targetId: string;
  voteType: VoteType;
  createdAt: string;
}

export interface Achievement {
  id: string;
  userId: string;
  badgeCode: string;
  unlockedAt: string;
}

/** DB row types (snake_case, matching Supabase columns) */
export interface DbProfile {
  id: string;
  nickname: string;
  level: number;
  exp: number;
  streak_current: number;
  streak_best: number;
  avatar_seed: string | null;
  created_at: string;
}

export interface DbScan {
  id: string;
  user_id: string;
  created_at: string;
  images: ScanImage[];
  status: ScanStatus;
  is_public: boolean;
}

export interface DbAnalysis {
  id: string;
  scan_id: string;
  norwood_grade: number;
  score: number;
  details: AnalysisDetail;
  gemini_raw_response: Record<string, unknown> | null;
  model_version: string | null;
  created_at: string;
}

export interface DbTreatment {
  id: string;
  user_id: string;
  type: TreatmentType;
  name: string;
  started_at: string | null;
  ended_at: string | null;
  dosage: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface DbPost {
  id: string;
  user_id: string;
  board: BoardType;
  title: string;
  content: string;
  tags: string[];
  images: Record<string, unknown>[] | null;
  scan_id: string | null;
  vote_count: number;
  comment_count: number;
  is_adopted: boolean;
  created_at: string;
}

export interface DbComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  vote_count: number;
  created_at: string;
}

export interface DbVote {
  id: string;
  user_id: string;
  target_type: VoteTargetType;
  target_id: string;
  vote_type: VoteType;
  created_at: string;
}

export interface DbAchievement {
  id: string;
  user_id: string;
  badge_code: string;
  unlocked_at: string;
}
