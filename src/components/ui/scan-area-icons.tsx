import { type ReactElement } from "react";

interface ScanAreaIconProps {
  size?: number;
  className?: string;
}

/**
 * 정수리 (Crown / Top of head)
 * 심플한 위에서 본 머리 + 포커스 타겟
 */
export function CrownAreaIcon({ size = 32, className }: ScanAreaIconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 머리 (위에서 본 타원) */}
      <ellipse cx="24" cy="25" rx="15" ry="17" fill="#E8D5C0" />
      <ellipse cx="24" cy="25" rx="14" ry="16" fill="#4A3220" />
      {/* 가르마 */}
      <line x1="24" y1="10" x2="24" y2="40" stroke="#A07850" strokeWidth="1" opacity="0.5" />
      {/* 정수리 밝은 부분 */}
      <ellipse cx="24" cy="22" rx="4.5" ry="3.5" fill="#C4A882" opacity="0.6" />
      {/* 타겟 원 */}
      <circle cx="24" cy="22" r="9" stroke="#171717" strokeWidth="2" strokeDasharray="4 3" />
      {/* 타겟 중심점 */}
      <circle cx="24" cy="22" r="2" fill="#171717" opacity="0.6" />
    </svg>
  );
}

/**
 * 앞이마 (Front forehead)
 * 심플한 정면 얼굴 + 헤어라인 강조
 */
export function FrontAreaIcon({ size = 32, className }: ScanAreaIconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 머리카락 영역 */}
      <path
        d="M12 22 C12 12, 17 5, 24 5 C31 5, 36 12, 36 22"
        fill="#4A3220"
      />
      {/* 얼굴 */}
      <path
        d="M12 22 C12 22, 12 40, 18 44 C21 45.5, 27 45.5, 30 44 C36 40, 36 22, 36 22"
        fill="#F0DCC8"
      />
      {/* 이마 영역 */}
      <path
        d="M14 22 C14 22, 14 28, 24 28 C34 28, 34 22, 34 22"
        fill="#FAEBD7"
        opacity="0.5"
      />
      {/* 헤어라인 강조 */}
      <path
        d="M12 22 C12 12, 17 5, 24 5 C31 5, 36 12, 36 22"
        stroke="#171717"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* 눈 (점) */}
      <circle cx="19" cy="33" r="1.5" fill="#999" opacity="0.4" />
      <circle cx="29" cy="33" r="1.5" fill="#999" opacity="0.4" />
      {/* 화살표: 헤어라인 가리킴 */}
      <path d="M7 14 L11 18" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M41 14 L37 18" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/**
 * 측면이마 (Side / Temple area)
 * 심플한 옆얼굴 + M자 관자놀이 강조
 */
export function SideAreaIcon({ size = 32, className }: ScanAreaIconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
      {/* 머리카락 (옆모습) */}
      <path
        d="M20 8 C28 5, 35 10, 36 18 C37 24, 36 28, 34 28 L20 28 C16 28, 14 24, 14 18 C14 12, 16 9, 20 8Z"
        fill="#4A3220"
      />
      {/* 얼굴 (옆모습) */}
      <path
        d="M16 24 C16 18, 19 14, 22 14 C25 14, 30 16, 32 22 C33 26, 33 30, 31 34 C30 37, 28 40, 25 42 C22 42, 19 40, 17 36 C16 32, 16 28, 16 24Z"
        fill="#F0DCC8"
      />
      {/* 귀 */}
      <ellipse cx="15" cy="30" rx="2" ry="3.5" fill="#E4C8A8" />
      {/* M자 관자놀이 영역 강조 */}
      <path
        d="M18 16 C19 12, 22 9, 26 8"
        stroke="#171717"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* 포커스 영역 */}
      <ellipse cx="21" cy="14" rx="6" ry="5" stroke="#171717" strokeWidth="1.5" strokeDasharray="3 2.5" fill="none" />
      {/* 눈 */}
      <circle cx="28" cy="27" r="1.5" fill="#999" opacity="0.4" />
      {/* 코 */}
      <path d="M33 30 C34 33, 33 35, 32 36" stroke="#D4B896" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}
