"use client";

import type { ReactElement } from "react";
import { motion } from "framer-motion";
import PageContainer from "@/components/layout/PageContainer";

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const VIEWPORT = { once: true, margin: "-60px" };
const TRANSITION = { duration: 0.45, ease: "easeOut" as const };

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SectionCardProps {
  index: number;
  title: string;
  children: React.ReactNode;
  accent?: "default" | "warning" | "info";
}

function SectionCard({
  index,
  title,
  children,
  accent = "default",
}: SectionCardProps): ReactElement {
  const accentStyles: Record<string, string> = {
    default: "border-border bg-muted/30 dark:bg-muted/10",
    warning:
      "border-amber-300/60 bg-amber-50/60 dark:border-amber-700/40 dark:bg-amber-950/20",
    info: "border-blue-300/60 bg-blue-50/60 dark:border-blue-700/40 dark:bg-blue-950/20",
  };

  const badgeStyles: Record<string, string> = {
    default: "bg-foreground text-background",
    warning: "bg-amber-500 text-white",
    info: "bg-blue-500 text-white",
  };

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      transition={TRANSITION}
      className={`rounded-xl border p-5 sm:p-6 ${accentStyles[accent]}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <span
          className={`shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold tabular-nums ${badgeStyles[accent]}`}
          aria-hidden="true"
        >
          {index}
        </span>
        <h2 className="text-base sm:text-lg font-semibold leading-snug text-foreground">
          {title}
        </h2>
      </div>
      <div className="pl-9 space-y-3 text-sm text-muted-foreground leading-relaxed">
        {children}
      </div>
    </motion.section>
  );
}

interface BulletListProps {
  items: { label?: string; text: string }[];
}

function BulletList({ items }: BulletListProps): ReactElement {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span
            className="mt-1.5 shrink-0 h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
            aria-hidden="true"
          />
          <span>
            {item.label && (
              <strong className="font-medium text-foreground">
                {item.label}{" "}
              </strong>
            )}
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function TermsPage(): ReactElement {
  return (
    <PageContainer className="py-12 pb-20">
      {/* ------------------------------------------------------------------ */}
      {/* Page header                                                         */}
      {/* ------------------------------------------------------------------ */}
      <motion.header
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ ...TRANSITION, duration: 0.5 }}
        className="mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
          <span aria-hidden="true">📄</span>
          법적 고지
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          이용약관
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
          본 약관은 Alopedia와 이용자 간의 권리·의무 및 책임 사항을 규정합니다.
          서비스를 이용하면 본 약관에 동의한 것으로 간주합니다.
        </p>
      </motion.header>

      {/* ------------------------------------------------------------------ */}
      {/* Sections                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4">
        {/* 1 */}
        <SectionCard index={1} title="서비스 개요">
          <p>
            Alopedia는 AI(Gemini Vision) 기반 두피 분석 및 개인 기록 관리
            플랫폼입니다. 사용자는 두피 사진을 업로드하여 노우드-해밀턴 스케일
            기반의 참고용 분석 결과를 받고, 개인 타임라인으로 변화를 추적할 수
            있습니다.
          </p>
        </SectionCard>

        {/* 2 — warning (의료 면책) */}
        <SectionCard index={2} title="의료 면책 조항" accent="warning">
          <p>
            서비스가 제공하는 AI 분석 결과는{" "}
            <strong className="font-semibold text-amber-700 dark:text-amber-400">
              참고용 정보
            </strong>
            에 한정되며, 어떠한 경우에도 의료 진단, 처방 또는 치료 권고를
            대체하지 않습니다.
          </p>
          <BulletList
            items={[
              {
                text: "서비스는 '분석합니다', '전문의 상담을 추천합니다' 등의 표현을 사용합니다.",
              },
              {
                text: "'진단합니다', '치료가 필요합니다', '약을 드세요' 등의 표현은 사용하지 않습니다.",
              },
              {
                text: "두피 관련 증상이 있는 경우 반드시 피부과 전문의와 상담하시기 바랍니다.",
              },
            ]}
          />
        </SectionCard>

        {/* 3 */}
        <SectionCard index={3} title="이용 규칙">
          <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
          <BulletList
            items={[
              { text: "타인의 개인정보 또는 사진을 무단으로 업로드하는 행위" },
              { text: "서비스의 정상적인 운영을 방해하는 행위" },
              {
                text: "허위 정보를 등록하거나 다른 이용자를 기만하는 행위",
              },
              {
                text: "저작권, 초상권 등 타인의 권리를 침해하는 행위",
              },
              {
                text: "상업적 목적의 광고·홍보 콘텐츠를 무단으로 게시하는 행위",
              },
              { text: "관련 법령을 위반하는 일체의 행위" },
            ]}
          />
        </SectionCard>

        {/* 4 */}
        <SectionCard index={4} title="콘텐츠 책임">
          <p>
            이용자가 서비스에 게시하는 모든 콘텐츠(다이어리, 후기, 댓글 등)에
            대한 책임은 해당 이용자에게 있습니다. 서비스는 이용자가 게시한
            콘텐츠로 인해 발생하는 법적 분쟁에 대해 책임을 지지 않습니다.
          </p>
          <p>
            서비스는 이용 규칙을 위반하는 콘텐츠를 사전 통보 없이 삭제하거나
            해당 계정의 이용을 제한할 수 있습니다.
          </p>
        </SectionCard>

        {/* 5 — info accent (프리미엄) */}
        <SectionCard index={5} title="프리미엄 서비스" accent="info">
          <p>
            일부 기능(월간 리포트, Before/After 비교, 체크리스트 통계 등)은
            프리미엄 플랜 이용자에게 제공됩니다.
          </p>
          <BulletList
            items={[
              {
                label: "무료 체험:",
                text: "최초 가입 시 30일 무료 체험 기간이 제공됩니다.",
              },
              {
                label: "유료 전환:",
                text: "체험 기간 종료 후 자동으로 유료 구독으로 전환되지 않습니다. 이용자가 직접 구독을 선택해야 합니다.",
              },
              {
                label: "환불:",
                text: "구독 요금의 환불은 관련 법령 및 별도 환불 정책에 따릅니다.",
              },
            ]}
          />
        </SectionCard>

        {/* 6 */}
        <SectionCard index={6} title="서비스 변경 및 중단">
          <p>
            서비스는 운영상·기술상의 이유로 제공하는 서비스의 전부 또는 일부를
            변경하거나 중단할 수 있습니다. 중요한 변경 사항은 서비스 내 공지
            또는 이메일을 통해 사전 안내합니다.
          </p>
          <p>
            서비스 변경 또는 중단으로 인해 발생하는 손해에 대해 서비스는 법령이
            정한 범위 내에서만 책임을 집니다.
          </p>
        </SectionCard>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Footer info                                                         */}
      {/* ------------------------------------------------------------------ */}
      <motion.footer
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        transition={{ ...TRANSITION, delay: 0.1 }}
        className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-border bg-muted/30 dark:bg-muted/10 px-5 py-4 text-xs text-muted-foreground"
      >
        <span>
          <strong className="font-medium text-foreground">시행일:</strong>{" "}
          2026년 3월 31일
        </span>
        <span>
          문의:{" "}
          <a
            href="mailto:pediaalo@gmail.com"
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            pediaalo@gmail.com
          </a>
        </span>
      </motion.footer>
    </PageContainer>
  );
}
