import type { Metadata } from "next";
import type { ReactElement } from "react";
import PageContainer from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "이용약관 | Alopedia",
  description: "Alopedia 이용약관 — 서비스 개요, 의료 면책 조항, 이용 규칙을 안내합니다.",
};

export default function TermsPage(): ReactElement {
  return (
    <PageContainer className="py-12">
      <article className="prose prose-sm dark:prose-invert max-w-none">
        <h1>이용약관</h1>
        <p>
          본 약관은 Alopedia(이하 &quot;서비스&quot;)와 이용자 간의 권리·의무 및 책임 사항을 규정합니다.
          서비스를 이용하면 본 약관에 동의한 것으로 간주합니다.
        </p>

        <h2>1. 서비스 개요</h2>
        <p>
          Alopedia는 AI(Gemini Vision) 기반 두피 분석 및 개인 기록 관리 플랫폼입니다.
          사용자는 두피 사진을 업로드하여 노우드-해밀턴 스케일 기반의 참고용 분석 결과를 받고,
          개인 타임라인으로 변화를 추적할 수 있습니다.
        </p>

        <h2>2. 의료 면책 조항</h2>
        <p>
          서비스가 제공하는 AI 분석 결과는 <strong>참고용 정보</strong>에 한정되며,
          어떠한 경우에도 의료 진단, 처방 또는 치료 권고를 대체하지 않습니다.
        </p>
        <ul>
          <li>서비스는 &quot;분석합니다&quot;, &quot;전문의 상담을 추천합니다&quot; 등의 표현을 사용합니다.</li>
          <li>
            &quot;진단합니다&quot;, &quot;치료가 필요합니다&quot;, &quot;약을 드세요&quot; 등의 표현은 사용하지 않습니다.
          </li>
          <li>두피 관련 증상이 있는 경우 반드시 피부과 전문의와 상담하시기 바랍니다.</li>
        </ul>

        <h2>3. 이용 규칙</h2>
        <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
        <ul>
          <li>타인의 개인정보 또는 사진을 무단으로 업로드하는 행위</li>
          <li>서비스의 정상적인 운영을 방해하는 행위</li>
          <li>허위 정보를 등록하거나 다른 이용자를 기만하는 행위</li>
          <li>저작권, 초상권 등 타인의 권리를 침해하는 행위</li>
          <li>상업적 목적의 광고·홍보 콘텐츠를 무단으로 게시하는 행위</li>
          <li>관련 법령을 위반하는 일체의 행위</li>
        </ul>

        <h2>4. 콘텐츠 책임</h2>
        <p>
          이용자가 서비스에 게시하는 모든 콘텐츠(다이어리, 후기, 댓글 등)에 대한 책임은
          해당 이용자에게 있습니다. 서비스는 이용자가 게시한 콘텐츠로 인해 발생하는
          법적 분쟁에 대해 책임을 지지 않습니다.
        </p>
        <p>
          서비스는 이용 규칙을 위반하는 콘텐츠를 사전 통보 없이 삭제하거나
          해당 계정의 이용을 제한할 수 있습니다.
        </p>

        <h2>5. 프리미엄 서비스</h2>
        <p>
          일부 기능(월간 리포트, Before/After 비교, 체크리스트 통계 등)은 프리미엄 플랜 이용자에게 제공됩니다.
        </p>
        <ul>
          <li>
            <strong>무료 체험:</strong> 최초 가입 시 30일 무료 체험 기간이 제공됩니다.
          </li>
          <li>
            <strong>유료 전환:</strong> 체험 기간 종료 후 자동으로 유료 구독으로 전환되지 않습니다.
            이용자가 직접 구독을 선택해야 합니다.
          </li>
          <li>
            <strong>환불:</strong> 구독 요금의 환불은 관련 법령 및 별도 환불 정책에 따릅니다.
          </li>
        </ul>

        <h2>6. 서비스 변경 및 중단</h2>
        <p>
          서비스는 운영상·기술상의 이유로 제공하는 서비스의 전부 또는 일부를 변경하거나
          중단할 수 있습니다. 중요한 변경 사항은 서비스 내 공지 또는 이메일을 통해 사전 안내합니다.
        </p>
        <p>
          서비스 변경 또는 중단으로 인해 발생하는 손해에 대해 서비스는 법령이 정한 범위 내에서만 책임을 집니다.
        </p>

        <hr />
        <p>
          <strong>시행일:</strong> 2026년 3월 31일
        </p>
        <p>문의: contact@alopedia.app</p>
      </article>
    </PageContainer>
  );
}
