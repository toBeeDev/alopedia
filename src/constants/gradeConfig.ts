/** Norwood-Hamilton Scale 5-Grade Configuration */

export const GRADE_CONFIG = {
  1: {
    label: "정상",
    color: "#22C55E",
    emoji: "🦅",
    eagleLabel: "위장독수리",
    eagleDesc: "아직 털이 많아 독수리인 척하는 애송이",
    action: "기록 지속",
    showHospitalPopup: false,
  },
  2: {
    label: "경미",
    color: "#EAB308",
    emoji: "🐣",
    eagleLabel: "아기독수리",
    eagleDesc: "솜털이 하나둘 빠지며 진정한 독수리의 길로 입문",
    action: "정기 관찰",
    showHospitalPopup: false,
  },
  3: {
    label: "주의",
    color: "#F97316",
    emoji: "🌪️",
    eagleLabel: "바람독수리",
    eagleDesc: "정수리로 기류(바람)를 읽기 시작한 실전형 독수리",
    action: "관리 시작 권유",
    showHospitalPopup: false,
  },
  4: {
    label: "관리 필요",
    color: "#EF4444",
    emoji: "⚔️",
    eagleLabel: "전투독수리",
    eagleDesc: "한 올의 깃털이라도 더 지키기 위해 사투를 벌이는 전사",
    action: "전문의 상담 권유",
    showHospitalPopup: true,
  },
  5: {
    label: "전문 상담 추천",
    color: "#A855F7",
    emoji: "👑",
    eagleLabel: "대머리독수리",
    eagleDesc: "최종 진화 완료. 해탈의 경지에 오른 이 구역의 제왕",
    action: "전문의 상담 강력 권유",
    showHospitalPopup: true,
  },
} as const;

export type GradeLevel = keyof typeof GRADE_CONFIG;

export function getGradeConfig(
  grade: number,
): (typeof GRADE_CONFIG)[GradeLevel] {
  const clamped = Math.max(1, Math.min(5, Math.round(grade))) as GradeLevel;
  return GRADE_CONFIG[clamped];
}
