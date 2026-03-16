/** 레벨 시스템 유틸리티 */

const EXP_PER_LEVEL = 100;

/** 활동별 경험치 보상 */
export const EXP_REWARDS = {
  DAILY_CHECK_IN: 5,
  SCAN_COMPLETED: 10,
  POST_CREATED: 5,
  COMMENT_CREATED: 2,
} as const;

/** 현재 레벨에서 다음 레벨까지 필요한 총 경험치 */
export function getExpForNextLevel(level: number): number {
  return EXP_PER_LEVEL + (level - 1) * 20;
}

/** 현재 레벨 내 진행률 (0~1) */
export function getLevelProgress(level: number, exp: number): number {
  const needed = getExpForNextLevel(level);
  return Math.min(exp / needed, 1);
}

/** 레벨 타이틀 */
export function getLevelTitle(level: number): string {
  if (level >= 50) return "전설의 독수리";
  if (level >= 30) return "숙련된 독수리";
  if (level >= 20) return "성장하는 독수리";
  if (level >= 10) return "날개를 펴는 독수리";
  if (level >= 5) return "깃털을 세우는 독수리";
  return "알에서 깨어난 독수리";
}
