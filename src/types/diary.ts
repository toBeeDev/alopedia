export const CHECKLIST_CATEGORY = {
  MEDICATION: "medication",
  TREATMENT: "treatment",
  LIFESTYLE: "lifestyle",
} as const;

export type ChecklistCategory = typeof CHECKLIST_CATEGORY[keyof typeof CHECKLIST_CATEGORY];

export const CHECKLIST_ITEMS = {
  medication: [
    { key: "finasteride", label: "피나스테리드" },
    { key: "minoxidil", label: "미녹시딜" },
    { key: "dutasteride", label: "두타스테리드" },
    { key: "other_med", label: "기타 약물" },
  ],
  treatment: [
    { key: "mesotherapy", label: "메조테라피" },
    { key: "prp", label: "PRP" },
    { key: "transplant", label: "모발이식" },
    { key: "other_treatment", label: "기타 시술" },
  ],
  lifestyle: [
    { key: "sleep_7h", label: "수면 7시간+" },
    { key: "exercise", label: "운동" },
    { key: "stress_low", label: "스트레스 낮음" },
    { key: "stress_mid", label: "스트레스 보통" },
    { key: "stress_high", label: "스트레스 높음" },
  ],
} as const satisfies Record<ChecklistCategory, readonly { key: string; label: string }[]>;

export interface DiaryChecklist {
  id: string;
  entryId: string;
  category: ChecklistCategory;
  item: string;
  checked: boolean;
}

export interface DiaryEntry {
  id: string;
  userId: string;
  scanId: string | null;
  date: string;
  memo: string | null;
  isPublic: boolean;
  isPhotoPublic: boolean;
  createdAt: string;
  updatedAt: string;
  checklists?: DiaryChecklist[];
  scan?: {
    images: { type: string; url: string; thumbnailUrl: string }[];
    status: string;
  };
  analysis?: {
    norwoodGrade: number;
    score: number;
    details: Record<string, unknown>;
  };
  profile?: {
    nickname: string;
    avatarSeed: string | null;
  };
}

export interface DiaryCalendarDot {
  date: string;
  norwoodGrade: number | null;
  hasEntry: boolean;
}

export interface DiaryReportData {
  scoreTrend: { date: string; score: number; grade: number }[];
  checklistStats: {
    category: ChecklistCategory;
    item: string;
    totalDays: number;
    checkedDays: number;
    rate: number;
  }[];
  summary: {
    totalEntries: number;
    avgScore: number;
    bestScore: number;
    currentStreak: number;
  };
}

export interface DbDiaryEntry {
  id: string;
  user_id: string;
  scan_id: string | null;
  date: string;
  memo: string | null;
  is_public: boolean;
  is_photo_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbDiaryChecklist {
  id: string;
  entry_id: string;
  category: string;
  item: string;
  checked: boolean;
}
