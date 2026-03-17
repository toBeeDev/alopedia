/** Eagle SVG markup strings for Canvas rendering (one per grade) */

import type { GradeLevel } from "@/constants/gradeConfig";

export const EAGLE_SVG_STRINGS: Record<GradeLevel, string> = {
  1: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M12 16c-1-4 1-8 4-10s5 0 8-1 5-3 8 0 3 7 2 11" fill="#5C3A0E"/>
    <path d="M10 20c-3-1-4 0-4 2s2 2 4 1" fill="#5C3A0E"/>
    <path d="M38 20c3-1 4 0 4 2s-2 2-4 1" fill="#5C3A0E"/>
    <ellipse cx="24" cy="32" rx="10" ry="10" fill="#8B5E1A"/>
    <path d="M14 30c-2 1-4 4-3 8l-2-1c-1-4 1-8 4-8l1 1z" fill="#6B3F0A"/>
    <path d="M34 30c2 1 4 4 3 8l2-1c1-4-1-8-4-8l-1 1z" fill="#6B3F0A"/>
    <ellipse cx="24" cy="34" rx="6" ry="6" fill="#FDE68A"/>
    <ellipse cx="24" cy="18" rx="9" ry="8" fill="#7C4A12"/>
    <ellipse cx="24" cy="20" rx="6.5" ry="5.5" fill="#FBBF24"/>
    <path d="M17.5 16.5q6.5-2 13 0" stroke="#22C55E" stroke-width="3" stroke-linecap="round"/>
    <circle cx="21" cy="20" r="2" fill="white"/>
    <circle cx="27" cy="20" r="2" fill="white"/>
    <circle cx="21.5" cy="20.3" r="1.1" fill="#1a1a1a"/>
    <circle cx="27.5" cy="20.3" r="1.1" fill="#1a1a1a"/>
    <circle cx="21" cy="19.5" r="0.5" fill="white"/>
    <circle cx="27" cy="19.5" r="0.5" fill="white"/>
    <path d="M23 23.5c0 0 .5-.3 1.2 0s.8 1.2.5 2c-.2.5-.6.5-1 .2-.2-.2-.5-.8-.7-2.2z" fill="#E8A100"/>
    <circle cx="18.5" cy="22" r="1.5" fill="#F9A8A8" opacity="0.5"/>
    <circle cx="29.5" cy="22" r="1.5" fill="#F9A8A8" opacity="0.5"/>
    <path d="M21 41l-1 2.5m1-2.5l1 2.5m5-2.5l-1 2.5m1-2.5l1 2.5" stroke="#D97706" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  2: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="8" cy="10" r="1.2" fill="#EAB308" opacity="0.5"/>
    <circle cx="40" cy="14" r="1" fill="#EAB308" opacity="0.4"/>
    <circle cx="6" cy="22" r="0.8" fill="#D4A017" opacity="0.4"/>
    <ellipse cx="24" cy="33" rx="9" ry="9" fill="#D4A017"/>
    <path d="M15 31c-1.5 1-3 3-2 6l-1.5-.5c-1-3 .5-6 2.5-6l1 .5z" fill="#B8860B"/>
    <path d="M33 31c1.5 1 3 3 2 6l1.5-.5c1-3-.5-6-2.5-6l-1 .5z" fill="#B8860B"/>
    <ellipse cx="24" cy="35" rx="5.5" ry="5" fill="#FEF3C7"/>
    <circle cx="24" cy="18" r="10" fill="#FBBF24"/>
    <path d="M19 9c.5-3 1.5-4 2.5-3s.5 3-.5 4" fill="#FDE68A"/>
    <path d="M24 7.5c0-3 1-4 2.5-3s.5 3-.5 4" fill="#D4A017"/>
    <path d="M29 9c-.5-3 .5-4 2-3.5s1 3 0 4.5" fill="#FDE68A"/>
    <path d="M14 16c.5-5 5-9 10-9s9.5 4 10 9" fill="#F5F5F0" stroke="#D1D5DB" stroke-width="0.6"/>
    <path d="M14 16l2.5-2.5 3 2 3-3.5 3 2.5 3-2 2.5 3.5" fill="#F5F5F0" stroke="#D1D5DB" stroke-width="0.6"/>
    <ellipse cx="24" cy="21" rx="7" ry="6" fill="#FEF3C7"/>
    <ellipse cx="21" cy="20.5" rx="2.8" ry="3" fill="white"/>
    <ellipse cx="27" cy="20.5" rx="2.8" ry="3" fill="white"/>
    <circle cx="21.5" cy="21.2" r="1.6" fill="#1a1a1a"/>
    <circle cx="27.5" cy="21.2" r="1.6" fill="#1a1a1a"/>
    <circle cx="20.8" cy="20" r="0.7" fill="white"/>
    <circle cx="26.8" cy="20" r="0.7" fill="white"/>
    <path d="M23 25c0 0 .5-.2 1 0s.6 1 .4 1.5c-.1.3-.5.4-.7.1-.2-.1-.4-.6-.7-1.6z" fill="#E8A100"/>
    <circle cx="17" cy="23" r="2" fill="#F9A8A8" opacity="0.5"/>
    <circle cx="31" cy="23" r="2" fill="#F9A8A8" opacity="0.5"/>
    <path d="M21 41l-1 2.5m1-2.5l1 2.5m5-2.5l-1 2.5m1-2.5l1 2.5" stroke="#D97706" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  3: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M3 15c5-.5 10 .5 16-1" stroke="#F97316" stroke-width="1.5" stroke-linecap="round" opacity="0.3"/>
    <path d="M1 22c7 0 12 1 18-.5" stroke="#F97316" stroke-width="1.2" stroke-linecap="round" opacity="0.2"/>
    <ellipse cx="7" cy="12" rx="1.2" ry="2.5" fill="#F97316" opacity="0.45" transform="rotate(-20 7 12)"/>
    <ellipse cx="10" cy="27" rx="1" ry="2" fill="#D97706" opacity="0.35" transform="rotate(-15 10 27)"/>
    <ellipse cx="27" cy="32" rx="10" ry="10" fill="#8B5E1A"/>
    <path d="M17 28c-4-1-9 0-13-2 3 0 7-.5 10 1l3 1z" fill="#6B3F0A"/>
    <path d="M37 28c2-1 5-1 7-2-1.5 1.5-4 2-6 2.5l-1-.5z" fill="#6B3F0A"/>
    <ellipse cx="27" cy="34" rx="6" ry="6" fill="#FDE68A"/>
    <ellipse cx="27" cy="17" rx="9" ry="8.5" fill="#6B3F0A"/>
    <ellipse cx="27" cy="10.5" rx="4" ry="2.5" fill="#DEB887" opacity="0.7"/>
    <path d="M24 11c.3-2 1-2.5 1.5-1.5" stroke="#5C3A0E" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M29 10.5c0-1.5 .8-2.2 1.3-1.2" stroke="#5C3A0E" stroke-width="1.2" stroke-linecap="round"/>
    <ellipse cx="27" cy="19" rx="6.5" ry="5.5" fill="#DEB887"/>
    <ellipse cx="24.5" cy="19" rx="2" ry="1.7" fill="white"/>
    <ellipse cx="29.5" cy="19" rx="2" ry="1.7" fill="white"/>
    <circle cx="25" cy="19.3" r="1.1" fill="#1a1a1a"/>
    <circle cx="30" cy="19.3" r="1.1" fill="#1a1a1a"/>
    <circle cx="24.5" cy="18.5" r="0.5" fill="white"/>
    <circle cx="29.5" cy="18.5" r="0.5" fill="white"/>
    <path d="M22.5 17l3.5-1" stroke="#5C3A0E" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M29 16l3 1" stroke="#5C3A0E" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M26 22c0 0 .5-.3 1.2 0s.8 1.2.5 2c-.2.5-.6.5-1 .2-.2-.2-.5-.8-.7-2.2z" fill="#E8A100"/>
    <path d="M25.5 24.5h3" stroke="#8B6914" stroke-width="0.7" stroke-linecap="round"/>
    <circle cx="21.5" cy="21" r="1.3" fill="#F9A8A8" opacity="0.4"/>
    <circle cx="32.5" cy="21" r="1.3" fill="#F9A8A8" opacity="0.4"/>
    <path d="M24 41l-1 2.5m1-2.5l1 2.5m5-2.5l-1 2.5m1-2.5l1 2.5" stroke="#D97706" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  4: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
    <path d="M5 24c0-.5 1.5-4 4-4s4 3.5 4 4v5c0 2.5-4 4.5-4 4.5S5 31.5 5 29V24z" fill="#EF4444"/>
    <line x1="9" y1="21.5" x2="9" y2="32" stroke="#FEE2E2" stroke-width="0.8"/>
    <line x1="6.5" y1="26.5" x2="11.5" y2="26.5" stroke="#FEE2E2" stroke-width="0.8"/>
    <ellipse cx="27" cy="32" rx="10" ry="10" fill="#6B7280"/>
    <ellipse cx="25.5" cy="30" rx="3" ry="5" fill="white" opacity="0.08"/>
    <path d="M37 28c1.5 1 3 3.5 2.5 7l1.5-.5c1-3.5-.5-7-3-7.5l-1 1z" fill="#4B5563"/>
    <ellipse cx="27" cy="34" rx="6" ry="5.5" fill="#FDE68A"/>
    <ellipse cx="27" cy="17" rx="9" ry="8.5" fill="#5C3A0E"/>
    <ellipse cx="27" cy="10" rx="5" ry="3" fill="#DEB887" opacity="0.75"/>
    <path d="M18 15q9-2 18 0" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M36 15c1.5-.3 3 0 3.5-.5m-3.5.5c1 .8 2 1.5 3 1.5" stroke="#EF4444" stroke-width="1.5" stroke-linecap="round"/>
    <ellipse cx="27" cy="19.5" rx="6.5" ry="5.5" fill="#DEB887"/>
    <ellipse cx="24.5" cy="19.5" rx="2" ry="2" fill="white"/>
    <ellipse cx="29.5" cy="19.5" rx="2" ry="2" fill="white"/>
    <circle cx="25" cy="19.8" r="1.2" fill="#1a1a1a"/>
    <circle cx="30" cy="19.8" r="1.2" fill="#1a1a1a"/>
    <circle cx="24.5" cy="19" r="0.5" fill="white"/>
    <circle cx="29.5" cy="19" r="0.5" fill="white"/>
    <path d="M22.5 17l3.5-1.5" stroke="#5C3A0E" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M29 15.5l3.5 1.5" stroke="#5C3A0E" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M26 23c0 0 .5-.3 1.2 0s.8 1.2.5 2c-.2.5-.6.5-1 .2-.2-.2-.5-.8-.7-2.2z" fill="#E8A100"/>
    <circle cx="21.5" cy="22" r="1.3" fill="#F9A8A8" opacity="0.4"/>
    <circle cx="32.5" cy="22" r="1.3" fill="#F9A8A8" opacity="0.4"/>
    <rect x="40" y="18" width="1.8" height="13" rx="0.9" fill="#9CA3AF"/>
    <rect x="39" y="16.5" width="3.8" height="2.5" rx="1" fill="#D97706"/>
    <path d="M24 41l-1 2.5m1-2.5l1 2.5m5-2.5l-1 2.5m1-2.5l1 2.5" stroke="#D97706" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  5: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" fill="url(#halo5)" opacity="0.2"/>
    <path d="M12 6l.5 2-.5 2m24-4l-.5 2 .5 2m-12-5.5v2.5" stroke="#FBBF24" stroke-width="1.2" stroke-linecap="round" opacity="0.6"/>
    <path d="M14 30c-2 5-3 10-1.5 14h23c1.5-4 .5-9-1.5-14" fill="#8B5CF6" opacity="0.35"/>
    <ellipse cx="24" cy="32" rx="10" ry="10" fill="#6B3F0A"/>
    <path d="M14 28c-3-.5-7 0-10-1.5 2.5.5 5.5 0 7.5.5l2.5 1z" fill="#5C3A0E"/>
    <path d="M34 28c3-.5 7 0 10-1.5-2.5.5-5.5 0-7.5.5l-2.5 1z" fill="#5C3A0E"/>
    <ellipse cx="24" cy="34" rx="6" ry="6" fill="#FDE68A"/>
    <circle cx="24" cy="17" r="10" fill="#FBBF24"/>
    <ellipse cx="21" cy="12" rx="3.5" ry="2.5" fill="white" opacity="0.45"/>
    <circle cx="19" cy="10.5" r="1.5" fill="white" opacity="0.5"/>
    <path d="M16 15l1.5-6 3.5 3 3-5 3 5 3.5-3 1.5 6H16z" fill="#F59E0B" stroke="#D97706" stroke-width="0.5"/>
    <circle cx="24" cy="11.5" r="1.2" fill="#EF4444"/>
    <circle cx="20.5" cy="12.5" r="0.7" fill="#8B5CF6"/>
    <circle cx="27.5" cy="12.5" r="0.7" fill="#8B5CF6"/>
    <ellipse cx="24" cy="20" rx="6.5" ry="5.5" fill="#FEF3C7"/>
    <ellipse cx="21.5" cy="20" rx="2.2" ry="2.2" fill="white"/>
    <ellipse cx="26.5" cy="20" rx="2.2" ry="2.2" fill="white"/>
    <circle cx="22" cy="20.3" r="1.2" fill="#1a1a1a"/>
    <circle cx="27" cy="20.3" r="1.2" fill="#1a1a1a"/>
    <circle cx="21.5" cy="19.5" r="0.5" fill="white"/>
    <circle cx="26.5" cy="19.5" r="0.5" fill="white"/>
    <path d="M19.5 17.5c1-.8 2.5-.8 3.5 0" stroke="#92400E" stroke-width="1" stroke-linecap="round"/>
    <path d="M25 17.5c1-.8 2.5-.8 3.5 0" stroke="#92400E" stroke-width="1" stroke-linecap="round"/>
    <path d="M23 23.5c0 0 .5-.3 1.2 0s.8 1.2.5 2c-.2.5-.6.5-1 .2-.2-.2-.5-.8-.7-2.2z" fill="#E8A100"/>
    <path d="M22 26c1 1 3 1 4 0" stroke="#92400E" stroke-width="0.8" stroke-linecap="round" fill="none"/>
    <circle cx="18.5" cy="22.5" r="1.5" fill="#F9A8A8" opacity="0.45"/>
    <circle cx="29.5" cy="22.5" r="1.5" fill="#F9A8A8" opacity="0.45"/>
    <path d="M21 41l-1 2.5m1-2.5l1 2.5m5-2.5l-1 2.5m1-2.5l1 2.5" stroke="#D97706" stroke-width="1.5" stroke-linecap="round"/>
    <defs>
      <radialGradient id="halo5" cx="24" cy="24" r="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stop-color="#A855F7" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="#A855F7" stop-opacity="0"/>
      </radialGradient>
    </defs>
  </svg>`,
};
