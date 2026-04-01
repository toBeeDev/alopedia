import type { DiaryEntry, DiaryChecklist } from "@/types/diary";

/** Map a Supabase diary_entries row (snake_case) to frontend DiaryEntry (camelCase) */
export function mapDiaryEntry(row: Record<string, unknown>): DiaryEntry {
  const checklists = Array.isArray(row.diary_checklists)
    ? (row.diary_checklists as Record<string, unknown>[]).map(mapChecklist)
    : undefined;

  const scan = row.scans as { images: { type: string; url: string; thumbnailUrl: string }[]; status: string } | null;
  const profile = row.profiles as { nickname: string; avatar_seed: string | null } | null;

  return {
    id: row.id as string,
    userId: row.user_id as string,
    scanId: (row.scan_id as string) ?? null,
    date: row.date as string,
    title: (row.title as string) ?? null,
    slug: (row.slug as string) ?? null,
    memo: (row.memo as string) ?? null,
    isPublic: row.is_public as boolean,
    isPhotoPublic: row.is_photo_public as boolean,
    blurLevel: (row.blur_level as "none" | "low" | "medium" | "high") ?? "none",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    checklists,
    scan: scan ?? undefined,
    profile: profile
      ? { nickname: profile.nickname, avatarSeed: profile.avatar_seed }
      : undefined,
    viewCount: (row.view_count as number) ?? 0,
    likeCount: (row.like_count as number) ?? 0,
    commentCount: (row.comment_count as number) ?? 0,
  };
}

function mapChecklist(row: Record<string, unknown>): DiaryChecklist {
  return {
    id: row.id as string,
    entryId: row.entry_id as string,
    category: row.category as DiaryChecklist["category"],
    item: row.item as string,
    checked: row.checked as boolean,
  };
}

/** Map analysis row */
export function mapAnalysis(
  row: Record<string, unknown> | null,
): DiaryEntry["analysis"] | null {
  if (!row) return null;
  return {
    norwoodGrade: row.norwood_grade as number,
    score: row.score as number,
    details: (row.details as Record<string, unknown>) ?? {},
  };
}
