import type { PhotoClassification } from "@/types/analysis";

/** Supabase Database Types */

export type ScanStatus = "pending" | "analyzing" | "completed" | "failed";
export type TreatmentType = "medication" | "procedure" | "supplement" | "shampoo";
export type VoteTargetType = "scan";

export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  nickname: string;
  role: UserRole;
  level: number;
  exp: number;
  streakCurrent: number;
  streakBest: number;
  avatarSeed: string | null;
  avatarUrl: string | null;
  createdAt: string;
  diaryPremiumUntil: string | null;
  termsAgreedAt: string | null;
}

export interface ScanImage {
  type: string;
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
  comparison?: string;
  areaScores?: AreaScores;
  photoClassification?: PhotoClassification[];
}

export interface AreaScores {
  crown: number;
  hairline: number;
  density: number;
}

export type FeedbackRating = "accurate" | "too_high" | "too_low";

export interface AnalysisFeedback {
  id: string;
  analysisId: string;
  rating: FeedbackRating;
  createdAt: string;
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
  role: UserRole;
  level: number;
  exp: number;
  streak_current: number;
  streak_best: number;
  avatar_seed: string | null;
  avatar_url: string | null;
  last_check_in: string | null;
  nickname_changed_at: string | null;
  created_at: string;
  diary_premium_until: string | null;
  terms_agreed_at: string | null;
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

export interface DbAchievement {
  id: string;
  user_id: string;
  badge_code: string;
  unlocked_at: string;
}
