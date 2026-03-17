import { type ReactElement } from "react";

interface ScanAreaIconProps {
  size?: number;
  className?: string;
}

/**
 * 정수리 — 아기독수리를 위에서 내려다본 모습
 */
export function CrownAreaIcon({ size = 20, className }: ScanAreaIconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 몸통 (위에서 본 타원) */}
      <ellipse cx="24" cy="28" rx="9" ry="7" fill="#D4A017" />
      {/* 배 */}
      <ellipse cx="24" cy="29" rx="5" ry="4" fill="#FEF3C7" />
      {/* 왼쪽 날개 */}
      <path d="M15 27c-3-1-7 0-10 2 3-.5 6 0 8.5 1l1.5-3z" fill="#B8860B" />
      {/* 오른쪽 날개 */}
      <path d="M33 27c3-1 7 0 10 2-3-.5-6 0-8.5 1l-1.5-3z" fill="#B8860B" />
      {/* 머리 (위에서 본 원형) */}
      <circle cx="24" cy="16" r="8" fill="#FBBF24" />
      {/* 정수리 하이라이트 */}
      <ellipse cx="23" cy="13" rx="3" ry="2" fill="white" opacity="0.4" />
      {/* 솜털 */}
      <path d="M22 8.5c.3-2 1-2.5 1.5-1.5" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M26 8c-.3-1.5.5-2.5 1.2-1.5" stroke="#D4A017" strokeWidth="1.5" strokeLinecap="round" />
      {/* 정수리 포커스 (점선 원) */}
      <circle cx="24" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
      {/* 포커스 중심점 */}
      <circle cx="24" cy="14" r="1.2" fill="currentColor" opacity="0.4" />
      {/* 꼬리 */}
      <path d="M22 35l2 4 2-4" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* 발 */}
      <path d="M21 35l-1.5 2m5.5-2l1.5 2" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 전면이마 — 아기독수리 정면 (이마/헤어라인 강조)
 */
export function FrontAreaIcon({ size = 20, className }: ScanAreaIconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 몸통 */}
      <ellipse cx="24" cy="36" rx="8" ry="7" fill="#D4A017" />
      {/* 날개 */}
      <path d="M16 34c-1.5 1-3 3-2 5.5l-1.5-.5c-1-2.5.5-5 2.5-5.5l1 .5z" fill="#B8860B" />
      <path d="M32 34c1.5 1 3 3 2 5.5l1.5-.5c1-2.5-.5-5-2.5-5.5l-1 .5z" fill="#B8860B" />
      {/* 배 */}
      <ellipse cx="24" cy="37.5" rx="4.5" ry="4" fill="#FEF3C7" />
      {/* 머리 */}
      <circle cx="24" cy="18" r="10" fill="#FBBF24" />
      {/* 솜털 */}
      <path d="M20 9c.3-2 1-2.5 1.5-1.5s.5 2-.2 3" fill="#FDE68A" />
      <path d="M25 7.5c0-2 .8-3 1.8-2s.5 2.5-.3 3.5" fill="#D4A017" />
      {/* 깨진 껍데기 */}
      <path d="M14 16c.5-5 5-9 10-9s9.5 4 10 9" fill="#F5F5F0" stroke="#D1D5DB" strokeWidth="0.6" />
      <path d="M14 16l2.5-2.5 3 2 3-3.5 3 2.5 3-2 2.5 3.5" fill="#F5F5F0" stroke="#D1D5DB" strokeWidth="0.6" />
      {/* 이마 강조 라인 */}
      <path d="M16 16c.5-4 4-7.5 8-7.5s7.5 3.5 8 7.5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" fill="none" />
      {/* 얼굴 */}
      <ellipse cx="24" cy="21" rx="7" ry="6" fill="#FEF3C7" />
      {/* 큰 눈 */}
      <ellipse cx="21" cy="20.5" rx="2.5" ry="2.8" fill="white" />
      <ellipse cx="27" cy="20.5" rx="2.5" ry="2.8" fill="white" />
      <circle cx="21.5" cy="21" r="1.4" fill="#1a1a1a" />
      <circle cx="27.5" cy="21" r="1.4" fill="#1a1a1a" />
      <circle cx="21" cy="20" r="0.6" fill="white" />
      <circle cx="27" cy="20" r="0.6" fill="white" />
      {/* 부리 */}
      <path d="M23 25c0 0 .5-.2 1 0s.6 1 .4 1.5c-.1.3-.5.4-.7.1-.2-.1-.4-.6-.7-1.6z" fill="#E8A100" />
      {/* 볼터치 */}
      <circle cx="17" cy="23" r="1.5" fill="#F9A8A8" opacity="0.45" />
      <circle cx="31" cy="23" r="1.5" fill="#F9A8A8" opacity="0.45" />
      {/* 발 */}
      <path d="M21 42l-1 2m1-2l1 2m5-2l-1 2m1-2l1 2" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * 측면이마 — 아기독수리 옆모습 (관자놀이 강조)
 */
export function SideAreaIcon({ size = 20, className }: ScanAreaIconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 몸통 */}
      <ellipse cx="22" cy="36" rx="8" ry="7" fill="#D4A017" />
      {/* 날개 (한쪽만 보임) */}
      <path d="M14 34c-1.5 1-3 3-2 5.5l-1.5-.5c-1-2.5.5-5 2.5-5.5l1 .5z" fill="#B8860B" />
      {/* 배 */}
      <ellipse cx="22" cy="37.5" rx="4.5" ry="4" fill="#FEF3C7" />
      {/* 머리 */}
      <circle cx="22" cy="18" r="10" fill="#FBBF24" />
      {/* 솜털 */}
      <path d="M18 9c.3-2 1.2-2.5 1.5-1.5s.3 2-.5 3" fill="#FDE68A" />
      <path d="M23 7.5c0-2 .8-3 1.8-2s.3 2.5-.5 3.5" fill="#D4A017" />
      {/* 깨진 껍데기 (옆면) */}
      <path d="M13 16c1-5 4.5-8 9-8s7 3 7.5 8" fill="#F5F5F0" stroke="#D1D5DB" strokeWidth="0.6" />
      <path d="M13 16l2-2 2.5 1.5 2.5-3 2.5 2 2-1.5 2 3" fill="#F5F5F0" stroke="#D1D5DB" strokeWidth="0.6" />
      {/* 얼굴 */}
      <ellipse cx="24" cy="21" rx="6" ry="6" fill="#FEF3C7" />
      {/* 눈 (한쪽만) */}
      <ellipse cx="26" cy="20.5" rx="2.5" ry="2.8" fill="white" />
      <circle cx="26.5" cy="21" r="1.4" fill="#1a1a1a" />
      <circle cx="26" cy="20" r="0.6" fill="white" />
      {/* 부리 (옆에서 돌출) */}
      <path d="M30 23c1.5 0 2.5.5 3 1.5-.5.5-1.5.5-2.5 0" stroke="#E8A100" strokeWidth="1.5" strokeLinecap="round" fill="#E8A100" />
      {/* 볼터치 */}
      <circle cx="28" cy="24" r="1.5" fill="#F9A8A8" opacity="0.45" />
      {/* 관자놀이 강조 (점선 원) */}
      <ellipse cx="16" cy="16" rx="4.5" ry="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" fill="none" />
      {/* 발 */}
      <path d="M19 42l-1 2m1-2l1 2m5-2l-1 2m1-2l1 2" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
