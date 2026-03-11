"use client";

import { useState, memo, type ReactElement } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Feather,
  MessageCircle,
  Camera,
  TrendingDown,
  TrendingUp,
  Megaphone,
  Lock,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageContainer from "@/components/layout/PageContainer";
import { COPY } from "@/constants/copy";
import { getGradeConfig } from "@/constants/gradeConfig";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";
import { useAuth } from "@/hooks/useAuth";
import type { WritePostData } from "@/components/board/WritePostModal";

const WritePostModal = dynamic(() => import("@/components/board/WritePostModal"), { ssr: false });
const DeletePinModal = dynamic(() => import("@/components/board/DeletePinModal"), { ssr: false });

const TAB_ALL = "전체" as const;

const BOARD_TABS = [
  TAB_ALL,
  COPY.BOARD_NAME.medication_review,
  COPY.BOARD_NAME.procedure_review,
  COPY.BOARD_NAME.qna,
  COPY.BOARD_NAME.lounge,
] as const;

const BOARD_KEY_MAP: Record<string, string> = {
  [COPY.BOARD_NAME.medication_review]: "medication_review",
  [COPY.BOARD_NAME.procedure_review]: "procedure_review",
  [COPY.BOARD_NAME.qna]: "qna",
  [COPY.BOARD_NAME.lounge]: "lounge",
};

interface BoardPost {
  id: string;
  type: "review" | "scan";
  tab: string;
  nickname: string;
  userId?: string;
  timeAgo: string;
  title: string;
  body: string;
  likes: number;
  comments: number;
  grade: number | null;
}

interface ScanAnalysis {
  postId: string;
  score: number;
  grade: number;
  hairline: string;
  density: string;
  thickness: string;
  scalpCondition: string;
  trend: "improving" | "stable" | "declining";
  scanCount: number;
}

interface NoticePost {
  id: string;
  title: string;
  body: string;
  timeAgo: string;
}

const NOTICE: NoticePost = {
  id: "notice-1",
  title: "Alopedia 커뮤니티 이용 안내",
  body: "안녕하세요, Alopedia 운영팀입니다. 커뮤니티는 탈모 관리 경험을 익명으로 공유하는 공간입니다. 서로 존중하며 건강한 정보를 나눠주세요. AI 분석 결과 공유 시 개인정보가 포함되지 않도록 주의해주세요. 의료 진단을 대체하는 조언은 삼가주시고, 전문적인 상담은 피부과 전문의를 방문해주세요.",
  timeAgo: "고정",
};

const BOARD_POSTS: BoardPost[] = [
  {
    id: "1",
    type: "review",
    tab: COPY.BOARD_NAME.medication_review,
    nickname: "익명의 관리자",
    timeAgo: "3시간 전",
    title: "피나스테리드 6개월 후기",
    body: "복용 초기에는 약간의 탈모가 있었지만 3개월 차부터 확실히 개선되기 시작했습니다. 사진 비교하면 정수리 부분이 많이 달라진 걸 느낄 수 있어요.",
    likes: 24,
    comments: 8,
    grade: 3,
  },
  {
    id: "s1",
    type: "scan",
    tab: COPY.BOARD_NAME.medication_review,
    nickname: "꾸준히기록중",
    timeAgo: "4시간 전",
    title: "3개월 차 AI 분석 결과 공유합니다",
    body: "미녹시딜 시작하고 3개월 됐어요. 지난달보다 점수가 올랐네요!",
    likes: 37,
    comments: 11,
    grade: 2,
  },
  {
    id: "2",
    type: "review",
    tab: COPY.BOARD_NAME.procedure_review,
    nickname: "두피지킴이",
    timeAgo: "5시간 전",
    title: "모발이식 2000모 후기 (3개월차)",
    body: "수술 후 첫 달은 좀 힘들었지만 지금은 자연스럽게 자라고 있어요. 비용은 부담되지만 결과는 만족스럽습니다.",
    likes: 42,
    comments: 15,
    grade: 4,
  },
  {
    id: "s2",
    type: "scan",
    tab: COPY.BOARD_NAME.lounge,
    nickname: "희망을보다",
    timeAgo: "7시간 전",
    title: "1등급 유지 중! 6개월 기록 공유",
    body: "꾸준히 관리한 덕분에 1등급 유지하고 있어요. 정수리 사진 변화 봐주세요.",
    likes: 63,
    comments: 21,
    grade: 1,
  },
  {
    id: "3",
    type: "review",
    tab: COPY.BOARD_NAME.medication_review,
    nickname: "꾸준함이답",
    timeAgo: "8시간 전",
    title: "미녹시딜 1년 사용 경험",
    body: "매일 꾸준히 바르는 게 핵심인 것 같아요. 처음엔 효과를 못 느꼈는데 6개월부터 주변에서 알아볼 정도로 변화가 있었습니다.",
    likes: 31,
    comments: 12,
    grade: 2,
  },
  {
    id: "s3",
    type: "scan",
    tab: COPY.BOARD_NAME.procedure_review,
    nickname: "이식후관리",
    timeAgo: "10시간 전",
    title: "모발이식 전후 AI 분석 비교",
    body: "이식 전 4등급에서 이식 후 6개월 만에 2등급으로 변화했어요. AI 분석 수치로 비교해봅니다.",
    likes: 89,
    comments: 34,
    grade: 2,
  },
  {
    id: "4",
    type: "review",
    tab: COPY.BOARD_NAME.qna,
    nickname: "탈모초보",
    timeAgo: "12시간 전",
    title: "두타스테리드와 피나스테리드 차이가 뭔가요?",
    body: "처음 약물 치료를 시작하려는데 두 약의 차이점이 궁금합니다. 부작용은 어떤 게 더 적은 편인지 경험담을 듣고 싶어요.",
    likes: 18,
    comments: 22,
    grade: null,
  },
  {
    id: "5",
    type: "review",
    tab: COPY.BOARD_NAME.procedure_review,
    nickname: "메조테라피경험자",
    timeAgo: "1일 전",
    title: "메조테라피 10회 완료 솔직 후기",
    body: "가격 대비 효과가 있는지 고민이 많았는데 확실히 두피 상태가 좋아진 느낌이에요. 다만 유지를 위해 꾸준히 받아야 할 것 같습니다.",
    likes: 27,
    comments: 9,
    grade: 3,
  },
  {
    id: "6",
    type: "review",
    tab: COPY.BOARD_NAME.lounge,
    nickname: "희망찾기",
    timeAgo: "1일 전",
    title: "탈모 관리 시작한 지 1년, 변화 공유",
    body: "작년 이맘때 처음 Alopedia로 기록을 시작했는데 사진으로 비교해보니 확실히 달라졌어요. 꾸준함이 제일 중요한 것 같습니다.",
    likes: 56,
    comments: 19,
    grade: 2,
  },
];

const SCAN_DETAILS: Record<string, ScanAnalysis> = {
  s1: {
    postId: "s1",
    score: 72.5,
    grade: 2,
    hairline: "전두부 헤어라인이 비교적 잘 유지되고 있으며 후퇴 징후가 경미합니다.",
    density: "정수리 모발 밀도가 지난 분석 대비 약간 증가한 것으로 보입니다.",
    thickness: "모발 굵기가 평균 수준이며 미세모가 일부 관찰됩니다.",
    scalpCondition:
      "두피 상태 양호, 약간의 건조함이 보이나 전반적으로 깨끗합니다.",
    trend: "improving",
    scanCount: 5,
  },
  s2: {
    postId: "s2",
    score: 88.3,
    grade: 1,
    hairline: "헤어라인이 자연스럽게 유지되고 있으며 후퇴 없음.",
    density: "전체 모발 밀도 양호, 정수리와 측면 모두 균일한 분포.",
    thickness: "모발 굵기가 건강한 수준으로 유지되고 있습니다.",
    scalpCondition: "두피 색상 정상, 염증이나 각질 이상 없음.",
    trend: "stable",
    scanCount: 12,
  },
  s3: {
    postId: "s3",
    score: 75.1,
    grade: 2,
    hairline: "이식 부위 헤어라인이 자연스럽게 자리잡고 있습니다.",
    density:
      "이식 부위 밀도가 점차 증가 중이며 기존 모발과 자연스러운 조화.",
    thickness: "이식모의 굵기가 기존 모발과 유사한 수준으로 성장 중.",
    scalpCondition:
      "이식 부위 두피가 안정화되었으며 붉은기가 거의 사라졌습니다.",
    trend: "improving",
    scanCount: 8,
  },
};

/* ── Sub-components ── */

function TrendBadge({
  trend,
}: {
  trend: ScanAnalysis["trend"];
}): ReactElement {
  const config = {
    improving: { label: "개선 중", color: "#22C55E", Icon: TrendingUp },
    stable: { label: "유지 중", color: "#6161FF", Icon: TrendingUp },
    declining: { label: "관찰 필요", color: "#EF4444", Icon: TrendingDown },
  } as const;
  const { label, color, Icon } = config[trend];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ backgroundColor: `${color}15`, color }}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function NoticeCard({ notice }: { notice: NoticePost }): ReactElement {
  return (
    <motion.article
      variants={fadeSlideUp}
      className="rounded-2xl border border-[#6161FF]/20 bg-[#6161FF]/5 p-5 shadow-sm"
    >
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6161FF]/10">
          <Megaphone className="h-4 w-4 text-[#6161FF]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-[#6161FF] px-1.5 py-0.5 text-[10px] font-bold text-white">
            {COPY.BOARD_NOTICE_BADGE}
          </span>
          <span className="rounded bg-[#6161FF]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#6161FF]">
            {COPY.BOARD_ADMIN_BADGE}
          </span>
        </div>
        <span className="ml-auto text-[11px] text-[#9DA0AE]">
          {notice.timeAgo}
        </span>
      </div>
      <h3 className="mb-1.5 text-sm font-bold text-[#323338]">
        {notice.title}
      </h3>
      <p className="text-sm leading-relaxed text-[#676879]">{notice.body}</p>
    </motion.article>
  );
}

function PostMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}): ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#F5F5F7]"
        aria-label="더보기"
      >
        <MoreVertical className="h-4 w-4 text-[#9DA0AE]" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 top-8 z-50 w-28 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-[#EEEFF2]"
            >
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-[#323338] hover:bg-[#F5F5F7]"
              >
                <Pencil className="h-3.5 w-3.5" />
                수정
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-red-500 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                삭제
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const ReviewCard = memo(function ReviewCard({
  post,
  blurred,
  isOwner,
  onEdit,
  onDelete,
}: {
  post: BoardPost;
  blurred: boolean;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}): ReactElement {
  return (
    <motion.article
      variants={fadeSlideUp}
      className="rounded-2xl bg-white p-5 shadow-sm"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F5F7] text-xs font-bold text-[#9DA0AE]">
            {post.nickname.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-semibold text-[#323338]">
              {post.nickname}
            </p>
            <p className="text-[11px] text-[#9DA0AE]">{post.timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.grade !== null && (() => {
            const gc = getGradeConfig(post.grade);
            return (
              <span
                className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full py-1 pl-1 pr-2.5 text-[11px] font-bold text-white"
                style={{ backgroundColor: gc.color }}
              >
                <EagleIcon grade={post.grade} size={18} /> {gc.eagleLabel}
              </span>
            );
          })()}
          {isOwner && <PostMenu onEdit={onEdit} onDelete={onDelete} />}
        </div>
      </div>

      <h3 className="mb-1.5 text-sm font-bold text-[#323338]">{post.title}</h3>
      <p
        className={`text-sm leading-relaxed text-[#676879] ${blurred ? "select-none blur-[6px]" : ""}`}
      >
        {post.body}
      </p>

      <div className="mt-3 flex items-center gap-4 text-xs text-[#9DA0AE]">
        <span className="flex items-center gap-1">
          <Feather className="h-3.5 w-3.5" />
          {post.likes}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          {post.comments}
        </span>
        <span className="ml-auto rounded-full bg-[#F5F5F7] px-2 py-0.5 text-[10px] font-medium text-[#9DA0AE]">
          {post.tab}
        </span>
      </div>
    </motion.article>
  );
});

const ScanCard = memo(function ScanCard({
  post,
  blurred,
  isOwner,
  onEdit,
  onDelete,
}: {
  post: BoardPost;
  blurred: boolean;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}): ReactElement {
  const scan = SCAN_DETAILS[post.id];
  if (!scan)
    return (
      <ReviewCard
        post={post}
        blurred={blurred}
        isOwner={isOwner}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

  const gc = getGradeConfig(scan.grade);

  return (
    <motion.article
      variants={fadeSlideUp}
      className="overflow-hidden rounded-2xl bg-white shadow-sm"
    >
      <div className="border-b border-[#EEEFF2] px-5 py-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6161FF]/10 text-xs font-bold text-[#6161FF]">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-[#323338]">
                  {post.nickname}
                </p>
                <span className="rounded bg-[#6161FF]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#6161FF]">
                  AI 분석
                </span>
              </div>
              <p className="text-[11px] text-[#9DA0AE]">{post.timeAgo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendBadge trend={scan.trend} />
            {isOwner && <PostMenu onEdit={onEdit} onDelete={onDelete} />}
          </div>
        </div>
        <h3 className="text-sm font-bold text-[#323338]">{post.title}</h3>
      </div>

      <div className="px-5 py-4">
        <div className="mb-3">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full py-1 pl-1 pr-2.5 text-xs font-bold text-white"
              style={{ backgroundColor: gc.color }}
            >
              <EagleIcon grade={scan.grade} size={18} /> {gc.eagleLabel}
            </span>
            <span className="text-xs text-[#9DA0AE]">
              {scan.score.toFixed(1)}점 · {scan.scanCount}회차 기록
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-[#9DA0AE]">
            {gc.eagleDesc}
          </p>
        </div>

        <p
          className={`mb-3 text-sm leading-relaxed text-[#676879] ${blurred ? "select-none blur-[6px]" : ""}`}
        >
          {post.body}
        </p>

        <div
          className={`space-y-2 ${blurred ? "select-none blur-[6px]" : ""}`}
        >
          {(
            [
              ["헤어라인", scan.hairline],
              ["모발 밀도", scan.density],
              ["모발 굵기", scan.thickness],
              ["두피 상태", scan.scalpCondition],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[#F5F5F7] p-3">
              <p className="mb-0.5 text-[11px] font-semibold text-[#323338]">
                {label}
              </p>
              <p className="text-xs leading-relaxed text-[#676879]">{value}</p>
            </div>
          ))}
        </div>

        <div
          className={`mt-3 grid grid-cols-3 gap-1.5 ${blurred ? "select-none blur-[8px]" : ""}`}
        >
          <div className="aspect-square rounded-xl bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB]" />
          <div className="aspect-square rounded-xl bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB]" />
          <div className="aspect-square rounded-xl bg-gradient-to-br from-[#E5E7EB] to-[#D1D5DB]" />
        </div>
      </div>

      <div className="border-t border-[#EEEFF2] px-5 py-3">
        <div className="flex items-center gap-4 text-xs text-[#9DA0AE]">
          <span className="flex items-center gap-1">
            <Feather className="h-3.5 w-3.5" />
            {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {post.comments}
          </span>
          <span className="ml-auto rounded-full bg-[#F5F5F7] px-2 py-0.5 text-[10px] font-medium text-[#9DA0AE]">
            {post.tab}
          </span>
        </div>
      </div>
    </motion.article>
  );
});

/* ── Page ── */

export default function BoardPage(): ReactElement {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(TAB_ALL);
  const isGuest = !user;

  const [showWrite, setShowWrite] = useState(false);
  const [editTarget, setEditTarget] = useState<BoardPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BoardPost | null>(null);

  const filteredPosts =
    activeTab === TAB_ALL
      ? BOARD_POSTS
      : BOARD_POSTS.filter((p) => p.tab === activeTab);

  function handleWrite(data: {
    board: string;
    title: string;
    content: string;
    deletePin: string;
  }): void {
    // TODO: Call API when connected to real data
    fetch("/api/board/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => {
      setShowWrite(false);
    });
  }

  function handleEdit(data: {
    board: string;
    title: string;
    content: string;
  }): void {
    if (!editTarget) return;
    fetch(`/api/board/posts/${editTarget.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(() => {
      setEditTarget(null);
    });
  }

  function handleDelete(pin: string): void {
    if (!deleteTarget) return;
    fetch(`/api/board/posts/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deletePin: pin }),
    }).then(() => {
      setDeleteTarget(null);
    });
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
      <PageContainer className="py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-lg font-bold text-[#323338] md:text-xl">
            {COPY.PAGE_TITLE_BOARD}
          </h1>
          {isGuest && !isLoading && (
            <p className="mt-1 text-sm text-[#676879]">
              {COPY.BOARD_PREVIEW_TITLE}
            </p>
          )}
        </motion.div>

        {/* Tab chips */}
        <div className="mb-6 flex gap-2 overflow-x-auto scrollbar-none">
          {BOARD_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-[#6161FF] text-white"
                  : "bg-white text-[#676879] hover:bg-[#F5F5F7]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="relative">
          <motion.div
            key={activeTab}
            className="space-y-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <NoticeCard notice={NOTICE} />

            {filteredPosts.map((post) => {
              const isOwner = !!user && post.userId === user.id;
              const cardProps = {
                post,
                blurred: isGuest,
                isOwner,
                onEdit: () => setEditTarget(post),
                onDelete: () => setDeleteTarget(post),
              };
              return post.type === "scan" ? (
                <ScanCard key={post.id} {...cardProps} />
              ) : (
                <ReviewCard key={post.id} {...cardProps} />
              );
            })}
          </motion.div>

          {/* Guest login CTA overlay */}
          {isGuest && !isLoading && (
            <>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB]/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-6">
                <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-2xl bg-white/95 px-8 py-6 shadow-lg backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6161FF]/10">
                    <Lock className="h-6 w-6 text-[#6161FF]" />
                  </div>
                  <p className="text-center text-sm text-[#676879]">
                    {COPY.BOARD_PREVIEW_LOGIN_DESC}
                  </p>
                  <Link
                    href="/login"
                    className="rounded-full bg-[#6161FF] px-8 py-3 text-sm font-semibold text-white shadow-md shadow-[#6161FF]/25 transition-all hover:bg-[#4338ca] hover:shadow-lg hover:shadow-[#6161FF]/30 active:scale-95"
                  >
                    {COPY.BOARD_PREVIEW_LOGIN_CTA}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </PageContainer>

      {/* FAB: Write button */}
      {!isGuest && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setShowWrite(true)}
          className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#6161FF] text-white shadow-lg shadow-[#6161FF]/30 transition-transform hover:scale-105 active:scale-95 lg:bottom-8 lg:right-8"
          aria-label="글쓰기"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </motion.button>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showWrite && (
          <WritePostModal
            onClose={() => setShowWrite(false)}
            onSubmit={handleWrite}
          />
        )}
        {editTarget && (
          <WritePostModal
            onClose={() => setEditTarget(null)}
            onSubmit={handleEdit}
            initial={{
              board:
                BOARD_KEY_MAP[editTarget.tab] ?? "lounge",
              title: editTarget.title,
              content: editTarget.body,
            }}
          />
        )}
        {deleteTarget && (
          <DeletePinModal
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
