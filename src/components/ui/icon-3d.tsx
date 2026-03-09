import { type ReactElement, type ReactNode } from "react";

interface Icon3DProps {
  children: ReactNode;
  color: string;
  secondaryColor: string;
  size?: number;
}

export function Icon3D({
  children,
  color,
  secondaryColor,
  size = 56,
}: Icon3DProps): ReactElement {
  return (
    <div
      className="relative flex items-center justify-center rounded-2xl"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${color}, ${secondaryColor})`,
        boxShadow: `0 8px 24px -4px ${color}66, 0 4px 8px -2px ${color}33, inset 0 1px 1px ${secondaryColor}88`,
        transform: "perspective(500px) rotateX(2deg)",
      }}
    >
      {/* Gloss overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(165deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 40%, transparent 60%)",
        }}
      />
      {/* Icon */}
      <div className="relative z-10 text-white drop-shadow-sm">{children}</div>
    </div>
  );
}

export function ScanIcon3D(): ReactElement {
  return (
    <Icon3D color="#6366F1" secondaryColor="#818CF8">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
      </svg>
    </Icon3D>
  );
}

export function HistoryIcon3D(): ReactElement {
  return (
    <Icon3D color="#10B981" secondaryColor="#34D399">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    </Icon3D>
  );
}

export function GuideIcon3D(): ReactElement {
  return (
    <Icon3D color="#F59E0B" secondaryColor="#FBBF24">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    </Icon3D>
  );
}

export function CommunityIcon3D(): ReactElement {
  return (
    <Icon3D color="#EC4899" secondaryColor="#F472B6">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    </Icon3D>
  );
}

export function ProfileIcon3D(): ReactElement {
  return (
    <Icon3D color="#8B5CF6" secondaryColor="#A78BFA">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </Icon3D>
  );
}
