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

  // 값 범위 클램핑
  return {
    norwoodGrade: clamp(parsed.norwoodGrade, 1, 5),
    score: clamp(parsed.score, 0, 100),
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

function sanitizeText(text: string): string {
  return text.trim().slice(0, 500);
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
