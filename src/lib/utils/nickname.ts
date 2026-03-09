/** 익명 닉네임 생성 유틸리티 */

const PREFIXES = [
  "두피전사",
  "모발수호자",
  "탈모파이터",
  "헤어히어로",
  "스칼프가디언",
  "모근지킴이",
  "두피탐험가",
  "헤어매니저",
] as const;

export function generateNickname(userId: string): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  const suffix = userId.replace(/-/g, "").slice(0, 6);
  return `${prefix}_${suffix}`;
}
