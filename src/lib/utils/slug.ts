/** 한글/영문 제목을 URL-safe slug로 변환 */
export function generateSlug(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "") // 문자, 숫자, 공백, 하이픈만 유지
    .replace(/\s+/g, "-") // 공백 → 하이픈
    .replace(/-+/g, "-") // 중복 하이픈 제거
    .replace(/^-|-$/g, "") // 양끝 하이픈 제거
    .slice(0, 80); // 최대 80자

  // 유니크성을 위한 4자리 랜덤 접미사
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}
