import { type ReactElement } from "react";
import type { GradeLevel } from "@/constants/gradeConfig";

interface EagleIconProps {
  size?: number;
  className?: string;
}

const EAGLE_ICON_MAP: Record<GradeLevel, (props: EagleIconProps) => ReactElement> = {
  1: DisguiseEagleIcon,
  2: BabyEagleIcon,
  3: WindEagleIcon,
  4: BattleEagleIcon,
  5: BaldEagleIcon,
};

/** 등급 번호로 해당 독수리 아이콘을 렌더링하는 공용 컴포넌트 */
export function EagleIcon({ grade, size = 32, className }: { grade: number; size?: number; className?: string }): ReactElement {
  const clamped = Math.max(1, Math.min(5, Math.round(grade))) as GradeLevel;
  const Icon = EAGLE_ICON_MAP[clamped];
  return <Icon size={size} className={className} />;
}

/**
 * LV.1 위장독수리
 * 풍성한 깃털 + 초록 머리띠
 */
export function DisguiseEagleIcon({ size = 32, className }: EagleIconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 풍성한 머리깃 */}
      <path d="M12 16c-1-4 1-8 4-10s5 0 8-1 5-3 8 0 3 7 2 11" fill="#5C3A0E" />
      <path d="M10 20c-3-1-4 0-4 2s2 2 4 1" fill="#5C3A0E" />
      <path d="M38 20c3-1 4 0 4 2s-2 2-4 1" fill="#5C3A0E" />
      {/* 몸통 */}
      <ellipse cx="24" cy="32" rx="10" ry="10" fill="#8B5E1A" />
      {/* 날개 */}
      <path d="M14 30c-2 1-4 4-3 8l-2-1c-1-4 1-8 4-8l1 1z" fill="#6B3F0A" />
      <path d="M34 30c2 1 4 4 3 8l2-1c1-4-1-8-4-8l-1 1z" fill="#6B3F0A" />
      {/* 배 */}
      <ellipse cx="24" cy="34" rx="6" ry="6" fill="#FDE68A" />
      {/* 머리 */}
      <ellipse cx="24" cy="18" rx="9" ry="8" fill="#7C4A12" />
      {/* 얼굴 */}
      <ellipse cx="24" cy="20" rx="6.5" ry="5.5" fill="#FBBF24" />
      {/* 머리띠 */}
      <path d="M17.5 16.5q6.5-2 13 0" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
      {/* 눈 */}
      <circle cx="21" cy="20" r="2" fill="white" />
      <circle cx="27" cy="20" r="2" fill="white" />
      <circle cx="21.5" cy="20.3" r="1.1" fill="#1a1a1a" />
      <circle cx="27.5" cy="20.3" r="1.1" fill="#1a1a1a" />
      <circle cx="21" cy="19.5" r="0.5" fill="white" />
      <circle cx="27" cy="19.5" r="0.5" fill="white" />
      {/* 부리 */}
      <path d="M23 23.5c0 0 .5-.3 1.2 0s.8 1.2.5 2c-.2.5-.6.5-1 .2-.2-.2-.5-.8-.7-2.2z" fill="#E8A100" />
      {/* 볼터치 */}
      <circle cx="18.5" cy="22" r="1.5" fill="#F9A8A8" opacity="0.5" />
      <circle cx="29.5" cy="22" r="1.5" fill="#F9A8A8" opacity="0.5" />
      {/* 발 */}
      <path d="M21 41l-1 2.5m1-2.5l1 2.5m5-2.5l-1 2.5m1-2.5l1 2.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * LV.2 아기독수리
 * 달걀 껍데기 + 큰 눈 + 솜털 날림
 */
export function BabyEagleIcon({ size = 32, className }: EagleIconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 날리는 솜털 */}
      <circle cx="8" cy="10" r="1.2" fill="#EAB308" opacity="0.5" />
      <circle cx="40" cy="14" r="1" fill="#EAB308" opacity="0.4" />
      <circle cx="6" cy="22" r="0.8" fill="#D4A017" opacity="0.4" />
      {/* 몸통 */}
      <ellipse cx="24" cy="33" rx="9" ry="9" fill="#D4A017" />
      {/* 날개 (짧은) */}
      <path d="M15 31c-1.5 1-3 3-2 6l-1.5-.5c-1-3 .5-6 2.5-6l1 .5z" fill="#B8860B" />
      <path d="M33 31c1.5 1 3 3 2 6l1.5-.5c1-3-.5-6-2.5-6l-1 .5z" fill="#B8860B" />
      {/* 배 */}
      <ellipse cx="24" cy="35" rx="5.5" ry="5" fill="#FEF3C7" />
      {/* 머리 */}
      <circle cx="24" cy="18" r="10" fill="#FBBF24" />
      {/* 솜털 */}
      <path d="M19 9c.5-3 1.5-4 2.5-3s.5 3-.5 4" fill="#FDE68A" />
      <path d="M24 7.5c0-3 1-4 2.5-3s.5 3-.5 4" fill="#D4A017" />
      <path d="M29 9c-.5-3 .5-4 2-3.5s1 3 0 4.5" fill="#FDE68A" />
      {/* 깨진 껍데기 */}
      <path d="M14 16c.5-5 5-9 10-9s9.5 4 10 9" fill="#F5F5F0" stroke="#D1D5DB" strokeWidth="0.6" />
      <path d="M14 16l2.5-2.5 3 2 3-3.5 3 2.5 3-2 2.5 3.5" fill="#F5F5F0" stroke="#D1D5DB" strokeWidth="0.6" />
      {/* 얼굴 */}
      <ellipse cx="24" cy="21" rx="7" ry="6" fill="#FEF3C7" />
      {/* 큰 눈 */}
      <ellipse cx="21" cy="20.5" rx="2.8" ry="3" fill="white" />
      <ellipse cx="27" cy="20.5" rx="2.8" ry="3" fill="white" />
      <circle cx="21.5" cy="21.2" r="1.6" fill="#1a1a1a" />
      <circle cx="27.5" cy="21.2" r="1.6" fill="#1a1a1a" />
      <circle cx="20.8" cy="20" r="0.7" fill="white" />
      <circle cx="26.8" cy="20" r="0.7" fill="white" />
      {/* 부리 */}
      <path d="M23 25c0 0 .5-.2 1 0s.6 1 .4 1.5c-.1.3-.5.4-.7.1-.2-.1-.4-.6-.7-1.6z" fill="#E8A100" />
      {/* 볼터치 */}
      <circle cx="17" cy="23" r="2" fill="#F9A8A8" opacity="0.5" />
      <circle cx="31" cy="23" r="2" fill="#F9A8A8" opacity="0.5" />
      {/* 발 */}
      <path d="M21 41l-1 2.5m1-2.5l1 2.5m5-2.5l-1 2.5m1-2.5l1 2.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * LV.3 바람독수리
 * 바람 + 날리는 깃털 + 정수리 빈곳
 */
export function WindEagleIcon({ size = 32, className }: EagleIconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 바람 */}
      <path d="M3 15c5-.5 10 .5 16-1" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      <path d="M1 22c7 0 12 1 18-.5" stroke="#F97316" strokeWidth="1.2" strokeLinecap="round" opacity="0.2" />
      {/* 날리는 깃털 */}
      <ellipse cx="7" cy="12" rx="1.2" ry="2.5" fill="#F97316" opacity="0.45" transform="rotate(-20 7 12)" />
      <ellipse cx="10" cy="27" rx="1" ry="2" fill="#D97706" opacity="0.35" transform="rotate(-15 10 27)" />
      {/* 몸통 */}
      <ellipse cx="27" cy="32" rx="10" ry="10" fill="#8B5E1A" />
      {/* 날개 (펼침) */}
      <path d="M17 28c-4-1-9 0-13-2 3 0 7-.5 10 1l3 1z" fill="#6B3F0A" />
      <path d="M37 28c2-1 5-1 7-2-1.5 1.5-4 2-6 2.5l-1-.5z" fill="#6B3F0A" />
      {/* 배 */}
      <ellipse cx="27" cy="34" rx="6" ry="6" fill="#FDE68A" />
      {/* 머리 */}
      <ellipse cx="27" cy="17" rx="9" ry="8.5" fill="#6B3F0A" />
      {/* 정수리 빈곳 */}
      <ellipse cx="27" cy="10.5" rx="4" ry="2.5" fill="#DEB887" opacity="0.7" />
      {/* 남은 머리카락 */}
      <path d="M24 11c.3-2 1-2.5 1.5-1.5" stroke="#5C3A0E" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M29 10.5c0-1.5 .8-2.2 1.3-1.2" stroke="#5C3A0E" strokeWidth="1.2" strokeLinecap="round" />
      {/* 얼굴 */}
      <ellipse cx="27" cy="19" rx="6.5" ry="5.5" fill="#DEB887" />
      {/* 찡그린 눈 */}
      <ellipse cx="24.5" cy="19" rx="2" ry="1.7" fill="white" />
      <ellipse cx="29.5" cy="19" rx="2" ry="1.7" fill="white" />
      <circle cx="25" cy="19.3" r="1.1" fill="#1a1a1a" />
      <circle cx="30" cy="19.3" r="1.1" fill="#1a1a1a" />
      <circle cx="24.5" cy="18.5" r="0.5" fill="white" />
      <circle cx="29.5" cy="18.5" r="0.5" fill="white" />
      {/* 화난 눈썹 */}
      <path d="M22.5 17l3.5-1" stroke="#5C3A0E" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M29 16l3 1" stroke="#5C3A0E" strokeWidth="1.3" strokeLinecap="round" />
      {/* 부리 */}
      <path d="M26 22c0 0 .5-.3 1.2 0s.8 1.2.5 2c-.2.5-.6.5-1 .2-.2-.2-.5-.8-.7-2.2z" fill="#E8A100" />
      {/* 꾹 다문 입 */}
      <path d="M25.5 24.5h3" stroke="#8B6914" strokeWidth="0.7" strokeLinecap="round" />
      {/* 볼터치 */}
      <circle cx="21.5" cy="21" r="1.3" fill="#F9A8A8" opacity="0.4" />
      <circle cx="32.5" cy="21" r="1.3" fill="#F9A8A8" opacity="0.4" />
      {/* 발 */}
      <path d="M24 41l-1 2.5m1-2.5l1 2.5m5-2.5l-1 2.5m1-2.5l1 2.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * LV.4 전투독수리
 * 빨간 머리띠 + 방패 + 결의
 */
export function BattleEagleIcon({ size = 32, className }: EagleIconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 방패 */}
      <path d="M5 24c0-.5 1.5-4 4-4s4 3.5 4 4v5c0 2.5-4 4.5-4 4.5S5 31.5 5 29V24z" fill="#EF4444" />
      <line x1="9" y1="21.5" x2="9" y2="32" stroke="#FEE2E2" strokeWidth="0.8" />
      <line x1="6.5" y1="26.5" x2="11.5" y2="26.5" stroke="#FEE2E2" strokeWidth="0.8" />
      {/* 몸통 */}
      <ellipse cx="27" cy="32" rx="10" ry="10" fill="#6B7280" />
      <ellipse cx="25.5" cy="30" rx="3" ry="5" fill="white" opacity="0.08" />
      {/* 날개 */}
      <path d="M37 28c1.5 1 3 3.5 2.5 7l1.5-.5c1-3.5-.5-7-3-7.5l-1 1z" fill="#4B5563" />
      {/* 배 */}
      <ellipse cx="27" cy="34" rx="6" ry="5.5" fill="#FDE68A" />
      {/* 머리 */}
      <ellipse cx="27" cy="17" rx="9" ry="8.5" fill="#5C3A0E" />
      {/* 정수리 (많이 빠짐) */}
      <ellipse cx="27" cy="10" rx="5" ry="3" fill="#DEB887" opacity="0.75" />
      {/* 빨간 머리띠 */}
      <path d="M18 15q9-2 18 0" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36 15c1.5-.3 3 0 3.5-.5m-3.5.5c1 .8 2 1.5 3 1.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
      {/* 얼굴 */}
      <ellipse cx="27" cy="19.5" rx="6.5" ry="5.5" fill="#DEB887" />
      {/* 결의 찬 눈 */}
      <ellipse cx="24.5" cy="19.5" rx="2" ry="2" fill="white" />
      <ellipse cx="29.5" cy="19.5" rx="2" ry="2" fill="white" />
      <circle cx="25" cy="19.8" r="1.2" fill="#1a1a1a" />
      <circle cx="30" cy="19.8" r="1.2" fill="#1a1a1a" />
      <circle cx="24.5" cy="19" r="0.5" fill="white" />
      <circle cx="29.5" cy="19" r="0.5" fill="white" />
      {/* 화난 눈썹 */}
      <path d="M22.5 17l3.5-1.5" stroke="#5C3A0E" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M29 15.5l3.5 1.5" stroke="#5C3A0E" strokeWidth="1.5" strokeLinecap="round" />
      {/* 부리 */}
      <path d="M26 23c0 0 .5-.3 1.2 0s.8 1.2.5 2c-.2.5-.6.5-1 .2-.2-.2-.5-.8-.7-2.2z" fill="#E8A100" />
      {/* 볼터치 */}
      <circle cx="21.5" cy="22" r="1.3" fill="#F9A8A8" opacity="0.4" />
      <circle cx="32.5" cy="22" r="1.3" fill="#F9A8A8" opacity="0.4" />
      {/* 칼 */}
      <rect x="40" y="18" width="1.8" height="13" rx="0.9" fill="#9CA3AF" />
      <rect x="39" y="16.5" width="3.8" height="2.5" rx="1" fill="#D97706" />
      {/* 발 */}
      <path d="M24 41l-1 2.5m1-2.5l1 2.5m5-2.5l-1 2.5m1-2.5l1 2.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * LV.5 대머리독수리
 * 반짝 대머리 + 왕관 + 보라 망토
 */
export function BaldEagleIcon({ size = 32, className }: EagleIconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 후광 */}
      <circle cx="24" cy="24" r="22" fill="url(#halo5)" opacity="0.2" />
      {/* 반짝 */}
      <path d="M12 6l.5 2-.5 2m24-4l-.5 2 .5 2m-12-5.5v2.5" stroke="#FBBF24" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
      {/* 망토 */}
      <path d="M14 30c-2 5-3 10-1.5 14h23c1.5-4 .5-9-1.5-14" fill="#8B5CF6" opacity="0.35" />
      {/* 몸통 */}
      <ellipse cx="24" cy="32" rx="10" ry="10" fill="#6B3F0A" />
      {/* 날개 */}
      <path d="M14 28c-3-.5-7 0-10-1.5 2.5.5 5.5 0 7.5.5l2.5 1z" fill="#5C3A0E" />
      <path d="M34 28c3-.5 7 0 10-1.5-2.5.5-5.5 0-7.5.5l-2.5 1z" fill="#5C3A0E" />
      {/* 배 */}
      <ellipse cx="24" cy="34" rx="6" ry="6" fill="#FDE68A" />
      {/* 머리 (반짝) */}
      <circle cx="24" cy="17" r="10" fill="#FBBF24" />
      {/* 광택 */}
      <ellipse cx="21" cy="12" rx="3.5" ry="2.5" fill="white" opacity="0.45" />
      <circle cx="19" cy="10.5" r="1.5" fill="white" opacity="0.5" />
      {/* 왕관 */}
      <path d="M16 15l1.5-6 3.5 3 3-5 3 5 3.5-3 1.5 6H16z" fill="#F59E0B" stroke="#D97706" strokeWidth="0.5" />
      <circle cx="24" cy="11.5" r="1.2" fill="#EF4444" />
      <circle cx="20.5" cy="12.5" r="0.7" fill="#8B5CF6" />
      <circle cx="27.5" cy="12.5" r="0.7" fill="#8B5CF6" />
      {/* 얼굴 */}
      <ellipse cx="24" cy="20" rx="6.5" ry="5.5" fill="#FEF3C7" />
      {/* 여유로운 눈 */}
      <ellipse cx="21.5" cy="20" rx="2.2" ry="2.2" fill="white" />
      <ellipse cx="26.5" cy="20" rx="2.2" ry="2.2" fill="white" />
      <circle cx="22" cy="20.3" r="1.2" fill="#1a1a1a" />
      <circle cx="27" cy="20.3" r="1.2" fill="#1a1a1a" />
      <circle cx="21.5" cy="19.5" r="0.5" fill="white" />
      <circle cx="26.5" cy="19.5" r="0.5" fill="white" />
      {/* 편안한 눈썹 */}
      <path d="M19.5 17.5c1-.8 2.5-.8 3.5 0" stroke="#92400E" strokeWidth="1" strokeLinecap="round" />
      <path d="M25 17.5c1-.8 2.5-.8 3.5 0" stroke="#92400E" strokeWidth="1" strokeLinecap="round" />
      {/* 부리 */}
      <path d="M23 23.5c0 0 .5-.3 1.2 0s.8 1.2.5 2c-.2.5-.6.5-1 .2-.2-.2-.5-.8-.7-2.2z" fill="#E8A100" />
      {/* 미소 */}
      <path d="M22 26c1 1 3 1 4 0" stroke="#92400E" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      {/* 볼터치 */}
      <circle cx="18.5" cy="22.5" r="1.5" fill="#F9A8A8" opacity="0.45" />
      <circle cx="29.5" cy="22.5" r="1.5" fill="#F9A8A8" opacity="0.45" />
      {/* 발 */}
      <path d="M21 41l-1 2.5m1-2.5l1 2.5m5-2.5l-1 2.5m1-2.5l1 2.5" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <radialGradient id="halo5" cx="24" cy="24" r="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}
