/** Norwood-Hamilton Scale 5-Grade Configuration */

export const GRADE_CONFIG = {
  1: {
    label: "정상",
    color: "#22C55E",
    emoji: "🟢",
    action: "기록 지속",
    showHospitalPopup: false,
  },
  2: {
    label: "경미",
    color: "#EAB308",
    emoji: "🟡",
    action: "정기 관찰",
    showHospitalPopup: false,
  },
  3: {
    label: "주의",
    color: "#F97316",
    emoji: "🟠",
    action: "관리 시작 권유",
    showHospitalPopup: false,
  },
  4: {
    label: "관리 필요",
    color: "#EF4444",
    emoji: "🔴",
    action: "전문의 상담 권유",
    showHospitalPopup: true,
  },
  5: {
    label: "전문 상담 추천",
    color: "#A855F7",
    emoji: "🟣",
    action: "전문의 상담 강력 권유",
    showHospitalPopup: true,
  },
} as const;

export type GradeLevel = keyof typeof GRADE_CONFIG;

export function getGradeConfig(grade: number): (typeof GRADE_CONFIG)[GradeLevel] {
  const clamped = Math.max(1, Math.min(5, Math.round(grade))) as GradeLevel;
  return GRADE_CONFIG[clamped];
}
