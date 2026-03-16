import type { GeminiAnalysisResponse, ScalpRegion } from "@/types/analysis";

/** Gemini 응답 텍스트에서 JSON 추출 및 검증 */
export function parseGeminiResponse(text: string): GeminiAnalysisResponse {
  // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ?? text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Gemini 응답에서 JSON을 찾을 수 없습니다.");
  }

  const jsonStr = jsonMatch[1] ?? jsonMatch[0];
  const parsed: unknown = JSON.parse(jsonStr);

  if (!isValidAnalysisResponse(parsed)) {
    throw new Error("Gemini 응답 형식이 올바르지 않습니다.");
  }

  // 등급 클램핑
  const grade = clamp(Math.round(parsed.norwoodGrade), 1, 5);
  // 등급-점수 교차검증: 점수를 등급 범위 내로 강제 보정
  const score = enforceGradeScoreSync(grade, parsed.score);

  return {
    norwoodGrade: grade,
    score,
    hairline: sanitizeText(parsed.hairline),
    density: sanitizeText(parsed.density),
    thickness: sanitizeText(parsed.thickness),
    scalpCondition: sanitizeText(parsed.scalpCondition),
    advice: sanitizeMedicalText(parsed.advice),
    scalpRegions: parseScalpRegions(parsed.scalpRegions),
  };
}

function isValidAnalysisResponse(
  data: unknown,
): data is GeminiAnalysisResponse {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.norwoodGrade === "number" &&
    typeof d.score === "number" &&
    typeof d.hairline === "string" &&
    typeof d.density === "string" &&
    typeof d.thickness === "string" &&
    typeof d.scalpCondition === "string" &&
    typeof d.advice === "string"
  );
}

function parseScalpRegions(raw: unknown): ScalpRegion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (r): r is ScalpRegion =>
        typeof r === "object" &&
        r !== null &&
        typeof r.imageIndex === "number" &&
        typeof r.x === "number" &&
        typeof r.y === "number" &&
        typeof r.w === "number" &&
        typeof r.h === "number",
    )
    .map((r) => ({
      imageIndex: r.imageIndex,
      x: clamp(r.x, 0, 1),
      y: clamp(r.y, 0, 1),
      w: clamp(r.w, 0, 1),
      h: clamp(r.h, 0, 1),
    }));
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** 등급별 허용 점수 범위 — 등급과 점수가 불일치하면 점수를 보정 */
const GRADE_SCORE_RANGE: Record<number, [number, number]> = {
  1: [85, 100],
  2: [68, 84],
  3: [45, 67],
  4: [25, 44],
  5: [0, 24],
};

function enforceGradeScoreSync(grade: number, rawScore: number): number {
  const [min, max] = GRADE_SCORE_RANGE[grade] ?? [0, 100];
  const clamped = clamp(rawScore, 0, 100);

  // 점수가 이미 등급 범위 내에 있으면 그대로 사용
  if (clamped >= min && clamped <= max) return clamped;

  // 범위 밖이면 가장 가까운 범위 끝으로 보정
  console.warn(
    `[parser] Grade-score mismatch: grade=${grade}, score=${rawScore} → clamped to [${min}, ${max}]`,
  );
  return clamped < min ? min : max;
}

function sanitizeText(text: string): string {
  return text.replace(/<[^>]*>/g, "").trim().slice(0, 500);
}

/** 의료 금지 표현 치환 */
const FORBIDDEN_REPLACEMENTS: [RegExp, string][] = [
  [/진단합니다/g, "분석합니다"],
  [/치료가 필요합니다/g, "전문의 상담을 추천합니다"],
  [/약을 드세요/g, "이런 치료를 받는 분들이 있어요"],
  [/처방합니다/g, "추천합니다"],
  [/투약/g, "복용"],
];

function sanitizeMedicalText(text: string): string {
  let sanitized = sanitizeText(text);
  for (const [pattern, replacement] of FORBIDDEN_REPLACEMENTS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}
