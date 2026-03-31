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
    default:
      "border-border bg-muted/30 dark:bg-muted/10",
    warning:
      "border-amber-300/60 bg-amber-50/60 dark:border-amber-700/40 dark:bg-amber-950/20",
    info:
      "border-blue-300/60 bg-blue-50/60 dark:border-blue-700/40 dark:bg-blue-950/20",
  };

  const badgeStyles: Record<string, string> = {
    default:
      "bg-foreground text-background",
    warning:
      "bg-amber-500 text-white",
    info:
      "bg-blue-500 text-white",
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
// Page — metadata is exported from a separate server segment in Next.js 16
// when using "use client". For static pages like this it's acceptable to
// keep metadata in a sibling layout or via generateMetadata; here we rely
// on the parent layout's title template and add a descriptive <title>
// through the document head directly.
// ---------------------------------------------------------------------------

export default function PrivacyPage(): ReactElement {
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
          <span aria-hidden="true">🔒</span>
          법적 고지
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          개인정보처리방침
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
          Alopedia는 이용자의 개인정보를 소중히 여기며, 관련 법령을 준수하여
          안전하게 처리합니다.
        </p>
      </motion.header>

      {/* ------------------------------------------------------------------ */}
      {/* Sections                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-4">
        {/* 1 */}
        <SectionCard index={1} title="수집하는 개인정보 항목">
          <p>서비스는 아래 항목을 수집합니다.</p>
          <BulletList
            items={[
              { label: "계정 정보:", text: "이메일 주소, 닉네임" },
              {
                label: "두피 사진:",
                text: "정수리·전면이마·측면이마 촬영 이미지",
              },
              {
                label: "AI 분석 결과:",
                text: "노우드-해밀턴 기반 두피 등급, 상세 항목 점수",
              },
              {
                label: "건강 기록:",
                text: "헤어 다이어리 체크리스트(약물·시술·생활습관 여부)",
              },
              {
                label: "메모:",
                text: "다이어리에 직접 입력한 자유 텍스트",
              },
            ]}
          />
        </SectionCard>

        {/* 2 */}
        <SectionCard index={2} title="수집 목적">
          <BulletList
            items={[
              {
                label: "AI 분석:",
                text: "업로드된 두피 사진을 Gemini Vision API로 분석하여 결과를 제공합니다.",
              },
              {
                label: "변화 추적:",
                text: "분석 이력과 다이어리를 타임라인으로 시각화합니다.",
              },
              {
                label: "커뮤니티:",
                text: "이용자가 동의한 경우에 한해 다이어리를 공개 피드에 노출합니다.",
              },
              {
                label: "통계·서비스 개선:",
                text: "익명화된 집계 데이터를 서비스 품질 향상에 활용합니다.",
              },
            ]}
          />
        </SectionCard>

        {/* 3 — warning accent (민감정보) */}
        <SectionCard index={3} title="민감정보 처리" accent="warning">
          <p>
            두피 사진 및 건강 기록은 「개인정보보호법」상 민감정보에 해당할 수
            있습니다. 서비스는 해당 정보를 수집·이용하기 전 별도의 명시적
            동의를 받으며, 동의를 철회하면 즉시 처리가 중단됩니다.
          </p>
        </SectionCard>

        {/* 4 */}
        <SectionCard index={4} title="보관 기간">
          <BulletList
            items={[
              {
                text: "회원 탈퇴 즉시 계정 및 모든 연관 데이터를 삭제합니다.",
              },
              {
                text: "법령에서 별도 보관 의무를 규정한 경우 해당 기간 동안 보관 후 파기합니다.",
              },
              {
                text: "업로드된 이미지는 서버 처리 시 EXIF 메타데이터(GPS, 기기 정보 등)가 자동으로 제거됩니다.",
              },
            ]}
          />
        </SectionCard>

        {/* 5 */}
        <SectionCard index={5} title="제3자 제공">
          <p>
            서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
            단, 이용자가 다이어리 공개를 선택한 경우 해당 내용(사진 포함 여부는
            별도 설정)이 서비스 내 공개 피드에 노출됩니다.
          </p>
        </SectionCard>

        {/* 6 */}
        <SectionCard index={6} title="이미지 처리 및 EXIF 제거" accent="info">
          <p>
            업로드된 모든 이미지는 서버에서 Sharp 라이브러리를 통해 처리되며,
            촬영 위치(GPS), 기기 모델, 촬영 시각 등 EXIF 메타데이터가 자동으로
            완전히 제거됩니다. 원본 파일명은 UUID로 대체되어 저장됩니다.
          </p>
        </SectionCard>

        {/* 7 */}
        <SectionCard index={7} title="이용자 권리">
          <p>이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
          <BulletList
            items={[
              {
                label: "열람:",
                text: "프로필 설정에서 수집된 정보를 확인할 수 있습니다.",
              },
              {
                label: "수정:",
                text: "닉네임, 이메일 등 계정 정보를 직접 변경할 수 있습니다.",
              },
              {
                label: "삭제:",
                text: "개별 분석 기록·다이어리 항목을 삭제하거나 계정 전체를 탈퇴할 수 있습니다.",
              },
              {
                label: "비공개 전환:",
                text: "공개 다이어리를 비공개로 변경할 수 있습니다.",
              },
            ]}
          />
        </SectionCard>

        {/* 8 — warning accent (AI 고지) */}
        <SectionCard index={8} title="AI 분석 관련 고지" accent="warning">
          <p>
            서비스가 제공하는 모든 AI 분석 결과는{" "}
            <strong className="font-semibold text-amber-700 dark:text-amber-400">
              참고용 정보
            </strong>
            이며, 의료 진단을 대체하지 않습니다. 두피 상태에 대한 정확한 진단은
            반드시 전문의와 상담하시기 바랍니다.
          </p>
          <p>
            등급 4~5에 해당하는 분석 결과가 나올 경우 전문의 상담을 권유하는
            안내가 표시됩니다.
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
