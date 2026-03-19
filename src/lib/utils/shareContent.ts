import { getGradeConfig } from "@/constants/gradeConfig";
import { COPY } from "@/constants/copy";
import type { AnalysisDetail } from "@/types/database";

interface KakaoShareContentOutput {
  title: string;
  description: string;
}

/** 카카오톡 바이럴 공유용 콘텐츠 — 점수/등급 숫자 노출 없이 호기심 유발 */
export function generateKakaoShareContent(grade: number): KakaoShareContentOutput {
  const config = getGradeConfig(grade);
  return {
    title: `너도 혹시... ${config.eagleLabel}? 🦅`,
    description: COPY.KAKAO_SHARE_DESCRIPTION,
  };
}

interface ShareContentInput {
  norwoodGrade: number;
  score: number;
  details: AnalysisDetail;
}

interface ShareContentOutput {
  title: string;
  content: string;
  tags: string[];
}

export function generateShareContent(data: ShareContentInput): ShareContentOutput {
  const config = getGradeConfig(data.norwoodGrade);

  const title = `${config.eagleLabel} ${data.score.toFixed(1)}점 — AI 분석 결과 공유`;

  const content = [
    `[AI 두피 분석 결과]`,
    ``,
    `등급: ${config.eagleLabel} (${data.norwoodGrade}단계)`,
    `점수: ${data.score.toFixed(1)} / 100`,
    ``,
    `▸ 헤어라인: ${data.details.hairline}`,
    `▸ 모발 밀도: ${data.details.density}`,
    `▸ 모발 굵기: ${data.details.thickness}`,
    `▸ 두피 상태: ${data.details.scalpCondition}`,
    `▸ 조언: ${data.details.advice}`,
    ``,
    `${COPY.DISCLAIMER_SHORT}`,
  ].join("\n");

  const tags = ["AI분석", config.label, "두피관리"];

  return { title, content, tags };
}
