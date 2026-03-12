"use client";

import { useRef, useState, type ReactElement, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  LogOut,
  Camera,
  Scan,
  MessageCircle,
  MessageSquare,
  Flame,
  Trophy,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/layout/PageContainer";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { useAuth } from "@/hooks/useAuth";
import {
  useProfile,
  useProfileStats,
  useUpdateNickname,
  useUploadAvatar,
} from "@/hooks/useProfile";
import { getGradeConfig } from "@/constants/gradeConfig";
import { COPY } from "@/constants/copy";
import { getLevelProgress, getLevelTitle, getExpForNextLevel } from "@/lib/utils/level";

export default function ProfilePage(): ReactElement {
  const { user, signOut } = useAuth();
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const { data: statsData, isLoading: statsLoading } = useProfileStats();
  const updateNickname = useUpdateNickname();
  const uploadAvatar = useUploadAvatar();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [nicknameError, setNicknameError] = useState("");

  const profile = profileData?.profile;
  const stats = statsData?.stats;
  const isLoading = profileLoading || statsLoading;

  const gradeConfig = stats?.latestGrade
    ? getGradeConfig(stats.latestGrade)
    : null;

  const level = profile?.level ?? 1;
  const exp = profile?.exp ?? 0;
  const progress = getLevelProgress(level, exp);
  const levelTitle = getLevelTitle(level);
  const expNeeded = getExpForNextLevel(level);

  function handleAvatarClick(): void {
    fileInputRef.current?.click();
  }

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAvatar.mutate(file);
  }

  function startEditNickname(): void {
    setNicknameInput(profile?.nickname ?? "");
    setNicknameError("");
    setEditingNickname(true);
  }

  function cancelEditNickname(): void {
    setEditingNickname(false);
    setNicknameError("");
  }

  function submitNickname(): void {
    const trimmed = nicknameInput.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      setNicknameError("2~20자로 입력해주세요.");
      return;
    }
    updateNickname.mutate(trimmed, {
      onSuccess: () => setEditingNickname(false),
      onError: (err) => setNicknameError(err.message),
    });
  }

  if (isLoading) {
    return (
      <PageContainer className="flex min-h-[60vh] items-center justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6161FF]/20 border-t-[#6161FF]" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        {/* ── 프로필 카드 ── */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-5">
            {/* 아바타 */}
            <button
              type="button"
              onClick={handleAvatarClick}
              className="group relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-[#F1F5F9]"
            >
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="프로필 사진"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6161FF]/10 to-[#6161FF]/5">
                  <span className="text-2xl font-bold text-[#6161FF]/40">
                    {(profile?.nickname ?? "?")[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              {uploadAvatar.isPending && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />

            {/* 닉네임 + 독수리 타이틀 */}
            <div className="min-w-0 flex-1">
              {editingNickname ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    maxLength={20}
                    className="w-full rounded-lg border border-[#EEEFF2] px-3 py-1.5 text-sm text-[#323338] focus:border-[#6161FF] focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitNickname();
                      if (e.key === "Escape") cancelEditNickname();
                    }}
                  />
                  <button
                    type="button"
                    onClick={submitNickname}
                    disabled={updateNickname.isPending}
                    className="rounded-lg bg-[#6161FF] p-1.5 text-white hover:bg-[#4F4FD9]"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditNickname}
                    className="rounded-lg bg-[#F1F5F9] p-1.5 text-[#9DA0AE] hover:bg-[#E2E5EA]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-lg font-bold text-[#323338]">
                    {profile?.nickname ?? "사용자"}
                  </h2>
                  <button
                    type="button"
                    onClick={startEditNickname}
                    className="rounded-md p-1 text-[#9DA0AE] hover:bg-[#F1F5F9] hover:text-[#676879]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {nicknameError && (
                <p className="mt-1 text-xs text-red-500">{nicknameError}</p>
              )}

              {/* 독수리 타이틀 */}
              {gradeConfig && stats?.latestGrade && (
                <div className="mt-1 flex items-center gap-1.5">
                  <EagleIcon grade={stats.latestGrade} size={20} />
                  <span
                    className="text-xs font-semibold"
                    style={{ color: gradeConfig.color }}
                  >
                    {gradeConfig.eagleLabel}
                  </span>
                  <span className="text-[10px] text-[#9DA0AE]">
                    · {gradeConfig.eagleDesc}
                  </span>
                </div>
              )}

              {/* 가입일 */}
              <p className="mt-1 text-[11px] text-[#9DA0AE]">
                {profile?.created_at
                  ? `${new Date(profile.created_at).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })} 가입`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        {/* ── 레벨 프로그레스 ── */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6161FF]/10">
                <Trophy className="h-4 w-4 text-[#6161FF]" />
              </div>
              <div>
                <span className="text-sm font-bold text-[#323338]">
                  Lv.{level}
                </span>
                <span className="ml-1.5 text-xs text-[#9DA0AE]">
                  {levelTitle}
                </span>
              </div>
            </div>
            <span className="text-xs text-[#9DA0AE]">
              {exp} / {expNeeded} EXP
            </span>
          </div>

          {/* 프로그레스 바 */}
          <div className="h-2.5 overflow-hidden rounded-full bg-[#F1F5F9]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#6161FF] to-[#8B8BFF]"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>

        {/* ── 활동 통계 ── */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-[#323338]">
            활동 요약
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Scan className="h-4 w-4 text-blue-500" />}
              bgColor="bg-blue-50"
              label="두피 분석"
              value={stats?.scanCount ?? 0}
              unit="회"
            />
            <StatCard
              icon={<MessageCircle className="h-4 w-4 text-emerald-500" />}
              bgColor="bg-emerald-50"
              label="게시글"
              value={stats?.postCount ?? 0}
              unit="개"
            />
            <StatCard
              icon={<MessageSquare className="h-4 w-4 text-amber-500" />}
              bgColor="bg-amber-50"
              label="댓글"
              value={stats?.commentCount ?? 0}
              unit="개"
            />
            <StatCard
              icon={<Flame className="h-4 w-4 text-rose-500" />}
              bgColor="bg-rose-50"
              label="연속 기록"
              value={profile?.streak_current ?? 0}
              unit="일"
            />
          </div>
        </div>

        {/* ── 최근 두피 상태 ── */}
        {gradeConfig && stats?.latestScore !== null && stats?.latestScore !== undefined && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-[#323338]">
              최근 두피 상태
            </h3>
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${gradeConfig.color}15` }}
              >
                <EagleIcon grade={stats.latestGrade!} size={36} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-bold"
                    style={{ color: gradeConfig.color }}
                  >
                    {gradeConfig.label}
                  </span>
                  <span className="text-xs text-[#9DA0AE]">
                    · {stats.latestScore.toFixed(0)}점
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#676879]">
                  {gradeConfig.action}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── 계정 정보 ── */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-[#323338]">
            계정 정보
          </h3>
          <p className="text-sm text-[#676879]">{user?.email ?? ""}</p>
        </div>

        {/* ── 로그아웃 ── */}
        <Button
          variant="ghost"
          onClick={signOut}
          className="w-full text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {COPY.LOGOUT}
        </Button>
      </motion.div>
    </PageContainer>
  );
}

function StatCard({
  icon,
  bgColor,
  label,
  value,
  unit,
}: {
  icon: ReactElement;
  bgColor: string;
  label: string;
  value: number;
  unit: string;
}): ReactElement {
  return (
    <div className="rounded-xl bg-[#F8FAFC] p-3">
      <div className={`mb-2 inline-flex rounded-lg p-1.5 ${bgColor}`}>
        {icon}
      </div>
      <p className="text-lg font-bold text-[#323338]">
        {value}
        <span className="ml-0.5 text-xs font-normal text-[#9DA0AE]">
          {unit}
        </span>
      </p>
      <p className="text-[11px] text-[#9DA0AE]">{label}</p>
    </div>
  );
}
