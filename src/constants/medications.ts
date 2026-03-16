/** 탈모약 카테고리 및 세부 의약품 목록 */

export const MEDICATION_CATEGORIES = [
  {
    id: "finasteride",
    label: "피나스테리드",
    drugs: ["프로페시아", "핀페시아", "프로스카", "핀카", "피나온", "모나드", "하이페시아", "카페시아"],
  },
  {
    id: "dutasteride",
    label: "두타스테리드",
    drugs: ["아보다트", "다모다트", "두타온", "두타프리"],
  },
  {
    id: "minoxidil_oral",
    label: "미녹시딜정",
    drugs: ["먹는 미녹시딜", "로니텐"],
  },
  {
    id: "spironolactone",
    label: "스피로놀락톤",
    drugs: ["알닥톤", "스피로닥톤"],
  },
  {
    id: "minoxidil_topical",
    label: "미녹시딜 5%액",
    drugs: ["로게인", "리게인", "잔드록스", "마이녹실", "스칼프메드", "미녹시딜폼"],
  },
  {
    id: "other",
    label: "기타의약품",
    drugs: ["시메티딘", "로아큐탄", "스티바A(트레티노인)", "다이안느", "드로겐정", "판토가"],
  },
] as const;

export type MedicationCategoryId = (typeof MEDICATION_CATEGORIES)[number]["id"];

/** 시술 후기 카테고리 */

export const PROCEDURE_CATEGORIES = [
  { id: "domestic_transplant", label: "국내모발이식 수술후기" },
  { id: "overseas_transplant", label: "해외모발이식 수술후기" },
  { id: "consultation", label: "병원상담후기" },
] as const;

export type ProcedureCategoryId = (typeof PROCEDURE_CATEGORIES)[number]["id"];

/** 태그별 배지 색상 매핑 — bg / text */
export const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  // 시술 후기 태그
  "국내모발이식 수술후기": { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
  "해외모발이식 수술후기": { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
  "병원상담후기": { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300" },
  // 탈모약 — 카테고리별 색상
  프로페시아: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
  핀페시아: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
  프로스카: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
  핀카: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
  피나온: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
  모나드: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
  하이페시아: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
  카페시아: { bg: "bg-violet-100 dark:bg-violet-900/30", text: "text-violet-700 dark:text-violet-300" },
  아보다트: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300" },
  다모다트: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300" },
  두타온: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300" },
  두타프리: { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-700 dark:text-pink-300" },
  "먹는 미녹시딜": { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-300" },
  로니텐: { bg: "bg-sky-100 dark:bg-sky-900/30", text: "text-sky-700 dark:text-sky-300" },
  알닥톤: { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300" },
  스피로닥톤: { bg: "bg-teal-100 dark:bg-teal-900/30", text: "text-teal-700 dark:text-teal-300" },
  로게인: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  리게인: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  잔드록스: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  마이녹실: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  스칼프메드: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  미녹시딜폼: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  시메티딘: { bg: "bg-slate-100 dark:bg-slate-800/50", text: "text-slate-700 dark:text-slate-300" },
  로아큐탄: { bg: "bg-slate-100 dark:bg-slate-800/50", text: "text-slate-700 dark:text-slate-300" },
  "스티바A(트레티노인)": { bg: "bg-slate-100 dark:bg-slate-800/50", text: "text-slate-700 dark:text-slate-300" },
  다이안느: { bg: "bg-slate-100 dark:bg-slate-800/50", text: "text-slate-700 dark:text-slate-300" },
  드로겐정: { bg: "bg-slate-100 dark:bg-slate-800/50", text: "text-slate-700 dark:text-slate-300" },
  판토가: { bg: "bg-slate-100 dark:bg-slate-800/50", text: "text-slate-700 dark:text-slate-300" },
};

const DEFAULT_TAG_COLOR = { bg: "bg-accent", text: "text-muted-foreground/70" };

/** 태그 이름으로 배지 색상 가져오기 */
export function getTagColor(tag: string): { bg: string; text: string } {
  return TAG_COLORS[tag] ?? DEFAULT_TAG_COLOR;
}
