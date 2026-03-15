"use client";

import { type ReactElement } from "react";
import { MapPin, Construction } from "lucide-react";
import { motion } from "framer-motion";
import PageContainer from "@/components/layout/PageContainer";
import { fadeSlideUp } from "@/lib/motion";

export default function HospitalPage(): ReactElement {
  return (
    <PageContainer className="py-6">
      <motion.div
        variants={fadeSlideUp}
        initial="hidden"
        animate="visible"
        className="flex min-h-[60vh] flex-col items-center justify-center text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-foreground/5">
          <MapPin className="h-10 w-10 text-foreground/40" />
        </div>

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
          <Construction className="h-3.5 w-3.5" />
          서비스 준비중
        </div>

        <h1 className="mt-3 text-xl font-bold text-foreground">
          탈모 병원 찾기
        </h1>
        <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-muted-foreground">
          내 주변 탈모 전문 병원을 찾고,
          <br />
          후기와 비용 정보를 확인할 수 있는
          <br />
          서비스를 준비하고 있어요.
        </p>

        <div className="mt-8 rounded-2xl bg-muted/50 px-6 py-4 ring-1 ring-border">
          <p className="text-[11px] leading-relaxed text-muted-foreground/70">
            병원 검색, 지도 기반 탐색, 진료 후기 등
            <br />
            다양한 기능이 곧 추가될 예정입니다.
          </p>
        </div>
      </motion.div>
    </PageContainer>
  );
}
