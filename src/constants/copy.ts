/** All user-facing text — never hardcode strings in components */

export const COPY = {
  // ── App ──
  APP_NAME: "Alopedia",
  APP_TAGLINE: "",

  // ── Medical Disclaimer (CRITICAL) ──
  DISCLAIMER_SHORT: "AI 참고용 분석 · 의료 진단 아님",
  DISCLAIMER_FULL:
    "본 분석 결과는 AI가 참고용으로 제공하는 것이며, 의료 진단을 대체하지 않습니다.",
  HOSPITAL_POPUP_TITLE: "전문가 상담을 추천해요",
  HOSPITAL_POPUP_BODY:
    "전문의와 상담하면 더 정확한 진단을 받을 수 있어요. 가까운 피부과를 방문해보시는 걸 추천드려요.",
  HOSPITAL_POPUP_CTA: "알겠어요",

  // ── Onboarding ──
  WELCOME: "반가워요! 두피 관리, 오늘부터 시작해볼까요?",
  FIRST_RESULT:
    "첫 번째 기록이 완성됐어요! 꾸준히 기록하면 변화를 확인할 수 있어요.",

  // ── Scan ──
  SCAN_GUIDE_TOP: "정수리부터 찍어볼게요. 가이드에 맞춰 촬영하면 돼요.",
  SCAN_GUIDE_FRONT: "이번엔 앞이마를 촬영해주세요.",
  SCAN_GUIDE_SIDE: "마지막으로 측면이마를 촬영해주세요.",
  SCAN_ANALYZING: "AI가 두피를 살펴보고 있어요...",
  SCAN_COMPLETE: "촬영이 완료됐어요!",
  SCAN_UPLOAD_WARN: "업로드 중에는 페이지를 이동하지 마세요.",

  // ── Analysis Results (by grade) ──
  GRADE_HEADLINE: {
    1: "건강한 두피예요",
    2: "살짝 신경 쓰이는 부분이 있어요",
    3: "관리를 시작하면 좋겠어요",
    4: "전문가 상담을 추천해요",
    5: "전문의 상담이 필요해요",
  } as Record<number, string>,
  GRADE_DESCRIPTION: {
    1: "현재 상태를 유지하면서 정기적으로 기록해보세요.",
    2: "정기적으로 관찰하면서 변화를 추적해보세요.",
    3: "지금부터 관리하면 충분히 개선할 수 있어요.",
    4: "전문의와 상담하면 더 정확한 진단을 받을 수 있어요.",
    5: "가까운 피부과를 방문해보시는 걸 추천드려요.",
  } as Record<number, string>,

  // ── Error & Empty States ──
  ERROR_NETWORK: "연결이 불안정해요. 잠시 후 다시 시도해주세요.",
  ERROR_ANALYSIS_FAILED: "분석 중 문제가 생겼어요. 다시 촬영해볼까요?",
  ERROR_PHOTO_INVALID:
    "두피가 잘 보이지 않아요. 가이드에 맞춰 다시 촬영해주세요.",
  EMPTY_HISTORY: "아직 기록이 없어요. 첫 번째 두피 분석을 시작해볼까요?",
  EMPTY_POSTS: "아직 작성된 글이 없어요. 첫 번째 후기를 남겨보세요!",
  BOARD_NOTICE_BADGE: "공지",
  BOARD_ADMIN_BADGE: "운영자",
  BOARD_PREVIEW_TITLE: "다른 분들의 후기를 미리 볼 수 있어요",
  BOARD_PREVIEW_LOGIN_CTA: "로그인하고 전체 보기",
  BOARD_PREVIEW_LOGIN_DESC:
    "로그인하면 모든 후기를 자세히 읽고, 직접 후기를 남길 수 있어요.",
  SHARE_ANALYSIS_TITLE: "분석 결과 공유하기",
  SHARE_ANALYSIS_INCLUDE_IMAGES: "두피 사진 포함하기",
  SHARE_ANALYSIS_IMAGE_WARNING:
    "사진은 익명으로 공유되며, EXIF 정보가 제거된 상태입니다.",
  SHARE_ANALYSIS_CTA: "게시판에 공유하기",

  // ── Gamification ──
  STREAK_ACHIEVED: (days: number): string =>
    `${days}일 연속 기록! 꾸준함이 대단해요.`,
  LEVEL_UP: (level: number): string =>
    `레벨 ${level} 달성! 두피 관리 습관이 자리잡고 있어요.`,
  BADGE_EARNED: (badge: string): string => `'${badge}' 뱃지를 획득했어요!`,

  // ── Community ──
  POST_CREATED: "후기가 등록됐어요. 다른 분들에게 큰 도움이 될 거예요.",
  COMMENT_NOTIFICATION: "내 글에 새 댓글이 달렸어요.",
  ADOPTION_NOTIFICATION: "내 답변이 채택됐어요!",

  // ── Auth ──
  LOGIN_TITLE: "로그인",
  SIGNUP_TITLE: "회원가입",
  LOGIN_CTA: "시작하기",
  LOGOUT: "로그아웃",

  // ── Board Point System (깃털) ──
  FEATHER_UNIT: "깃털",
  FEATHER_POST_REWARD: 10,
  FEATHER_COMMENT_REWARD: 2,
  FEATHER_BEST_REWARD: 50,
  FEATHER_LIKE_ACTION: "깃털 투척",
  FEATHER_REPORT_ACTION: "깃털 날리기",

  // ── Board Community Slang ──
  BOARD_SLANG_RICH_ALERT: "풍성충 침입 경보!",
  BOARD_SLANG_KING_ADVICE: "제왕의 조언",
  BOARD_SLANG_SAVE_OP: "깃털 사수 작전",

  // ── Board Names ──
  BOARD_NAME: {
    medication_review: "약물 후기",
    procedure_review: "시술 후기",
    qna: "Q&A",
    lounge: "자유게시판",
  } as Record<string, string>,

  // ── Hero / Landing ──
  HERO_TITLE: "AI로 시작하는",
  HERO_TITLE_ACCENT: "두피 관리",
  HERO_TITLE_SUFFIX: "의 새로운 기준",
  HERO_DESCRIPTION:
    "사진 한 장으로 두피 상태를 분석하고, 변화를 추적하며, 같은 고민을 가진 사람들과 경험을 나눌 수 있는 공간.",
  HERO_DESCRIPTION_2: "Alopedia와 함께 꾸준한 두피 관리를 시작하세요.",
  HERO_CTA: "두피 분석 시작하기",
  HERO_LOGIN_CTA: "로그인하기",
  HERO_BROWSE_CTA: "구경하기",
  HERO_SUB_CTA: "무료로 시작 · 회원가입 불필요",
  HERO_SOCIAL_PROOF: "1,200+명이 두피를 기록하고 있어요",

  // ── Features ──
  FEATURE_AI_TITLE: "AI 두피 분석",
  FEATURE_AI_DESC:
    "정수리, 이마, 측면을 촬영하면 AI가 노우드-해밀턴 스케일 기반으로 두피 상태를 분석합니다.",
  FEATURE_TRACK_TITLE: "변화 추적",
  FEATURE_TRACK_DESC:
    "타임라인과 비교 슬라이더로 두피 상태 변화를 한눈에 확인하세요.",
  FEATURE_COMMUNITY_TITLE: "익명 커뮤니티",
  FEATURE_COMMUNITY_DESC:
    "약물, 시술 후기를 익명으로 공유하고 실질적인 정보를 나눠보세요.",
  FEATURE_RECORD_TITLE: "꾸준한 기록",
  FEATURE_RECORD_DESC:
    "스트릭, 뱃지, 레벨 시스템으로 두피 관리 습관을 만들어갑니다.",

  // ── Navigation ──
  NAV_HOME: "홈",
  NAV_SCAN: "촬영",
  NAV_HISTORY: "기록",
  NAV_BOARD: "게시판",
  NAV_GUIDE: "분석 가이드",
  NAV_PROFILE: "프로필",
  NAV_HOSPITAL: "병원 찾기",
  NAV_OPEN: "메뉴 열기",
  NAV_CLOSE: "메뉴 닫기",

  // ── Page Titles ──
  PAGE_TITLE_HISTORY: "분석 기록",
  PAGE_TITLE_DASHBOARD: "대시보드",
  PAGE_TITLE_BOARD: "커뮤니티",
  PAGE_TITLE_GUIDE: "분석 방법",
  PAGE_TITLE_PROFILE: "프로필",

  // ── Guide Page ──
  GUIDE_HERO: "AI는 어떻게 두피를 분석할까요?",
  GUIDE_HERO_DESC:
    "Alopedia는 노우드-해밀턴 스케일을 기반으로 AI가 두피 사진을 분석합니다. 의료 진단이 아닌 참고용 분석이에요.",
  GUIDE_SECTION_SCALE: "노우드-해밀턴 척도",
  GUIDE_SECTION_SCALE_DESC:
    "국제적으로 사용되는 남성형 탈모 분류 기준을 5단계로 단순화했어요. AI가 촬영된 사진을 바탕으로 가장 가까운 등급을 판별합니다.",
  GUIDE_SECTION_GRADE: "두피 상태 등급",
  GUIDE_SECTION_GRADE_DESC:
    "등급별로 색상과 라벨이 다르게 표시돼요. 숫자가 높을수록 전문가 상담을 권유합니다.",
  GUIDE_SECTION_ICONS: "상태 표시 아이콘",
  GUIDE_SECTION_ICONS_DESC:
    "분석 결과 화면에서 볼 수 있는 아이콘들의 의미를 안내합니다.",
  GUIDE_SECTION_TREND: "두피 추세",
  GUIDE_SECTION_TREND_DESC:
    "여러 번 촬영하면 이전 기록과 비교해 개선/유지/관찰 필요 추세를 보여줘요.",
  GUIDE_SECTION_COLORS: "색상 분류",
  GUIDE_SECTION_COLORS_DESC:
    "각 등급에 할당된 색상은 직관적으로 상태를 파악할 수 있도록 설계됐어요.",
  GUIDE_SECTION_DETAIL: "상세 분석 항목",
  GUIDE_SECTION_DETAIL_DESC:
    "AI는 촬영된 사진에서 4가지 핵심 항목을 분석하고, 종합적인 조언을 제공합니다.",
  GUIDE_SECTION_FAIL: "분석 불가 케이스",
  GUIDE_SECTION_FAIL_DESC:
    "아래 경우에는 AI가 정확한 분석을 하기 어려워요. 가이드에 맞춰 다시 촬영해주세요.",
  GUIDE_SECTION_PHOTOS: "촬영 가이드",
  GUIDE_SECTION_PHOTOS_DESC:
    "정확한 분석을 위해 3장의 사진이 필요합니다. 각각의 촬영 방법을 확인하세요.",

  // ── a11y ──
  A11Y_SCAN_BUTTON: "두피 촬영하기",
  A11Y_ANALYZE_BUTTON: "AI 분석 시작하기",
  A11Y_GRADE: (grade: number, label: string): string =>
    `두피 상태 등급 ${grade}단계, ${label}`,
  A11Y_STREAK: (days: number): string => `연속 기록 ${days}일째`,
  A11Y_VOTE: (count: number): string =>
    `이 글에 공감하기, 현재 ${count}명 공감`,
  A11Y_SCALP_PHOTO: "본인의 두피 촬영 이미지",
} as const;
