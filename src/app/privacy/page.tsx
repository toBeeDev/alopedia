import type { Metadata } from "next";
import type { ReactElement } from "react";
import PageContainer from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "개인정보처리방침 | Alopedia",
  description: "Alopedia 개인정보처리방침 — 수집 항목, 목적, 보관 기간, 이용자 권리를 안내합니다.",
};

export default function PrivacyPage(): ReactElement {
  return (
    <PageContainer className="py-12">
      <article className="prose prose-sm dark:prose-invert max-w-none">
        <h1>개인정보처리방침</h1>
        <p>
          Alopedia(이하 &quot;서비스&quot;)는 이용자의 개인정보를 소중히 여기며, 관련 법령을 준수하여 안전하게 처리합니다.
        </p>

        <h2>1. 수집하는 개인정보 항목</h2>
        <p>서비스는 아래 항목을 수집합니다.</p>
        <ul>
          <li>
            <strong>계정 정보:</strong> 이메일 주소, 닉네임
          </li>
          <li>
            <strong>두피 사진:</strong> 정수리·전면이마·측면이마 촬영 이미지
          </li>
          <li>
            <strong>AI 분석 결과:</strong> 노우드-해밀턴 기반 두피 등급, 상세 항목 점수
          </li>
          <li>
            <strong>건강 기록:</strong> 헤어 다이어리 체크리스트(약물·시술·생활습관 여부)
          </li>
          <li>
            <strong>메모:</strong> 다이어리에 직접 입력한 자유 텍스트
          </li>
        </ul>

        <h2>2. 수집 목적</h2>
        <ul>
          <li>
            <strong>AI 분석:</strong> 업로드된 두피 사진을 Gemini Vision API로 분석하여 결과를 제공합니다.
          </li>
          <li>
            <strong>변화 추적:</strong> 분석 이력과 다이어리를 타임라인으로 시각화합니다.
          </li>
          <li>
            <strong>커뮤니티:</strong> 이용자가 동의한 경우에 한해 다이어리를 공개 피드에 노출합니다.
          </li>
          <li>
            <strong>통계·서비스 개선:</strong> 익명화된 집계 데이터를 서비스 품질 향상에 활용합니다.
          </li>
        </ul>

        <h2>3. 민감정보 처리</h2>
        <p>
          두피 사진 및 건강 기록은 「개인정보보호법」상 민감정보에 해당할 수 있습니다.
          서비스는 해당 정보를 수집·이용하기 전 별도의 명시적 동의를 받으며, 동의를 철회하면 즉시 처리가 중단됩니다.
        </p>

        <h2>4. 보관 기간</h2>
        <ul>
          <li>회원 탈퇴 즉시 계정 및 모든 연관 데이터를 삭제합니다.</li>
          <li>법령에서 별도 보관 의무를 규정한 경우 해당 기간 동안 보관 후 파기합니다.</li>
          <li>업로드된 이미지는 서버 처리 시 EXIF 메타데이터(GPS, 기기 정보 등)가 자동으로 제거됩니다.</li>
        </ul>

        <h2>5. 제3자 제공</h2>
        <p>
          서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
          단, 이용자가 다이어리 공개를 선택한 경우 해당 내용(사진 포함 여부는 별도 설정)이
          서비스 내 공개 피드에 노출됩니다.
        </p>

        <h2>6. 이미지 처리 및 EXIF 제거</h2>
        <p>
          업로드된 모든 이미지는 서버에서 Sharp 라이브러리를 통해 처리되며,
          촬영 위치(GPS), 기기 모델, 촬영 시각 등 EXIF 메타데이터가 자동으로 완전히 제거됩니다.
          원본 파일명은 UUID로 대체되어 저장됩니다.
        </p>

        <h2>7. 이용자 권리</h2>
        <p>이용자는 언제든지 아래 권리를 행사할 수 있습니다.</p>
        <ul>
          <li>
            <strong>열람:</strong> 프로필 설정에서 수집된 정보를 확인할 수 있습니다.
          </li>
          <li>
            <strong>수정:</strong> 닉네임, 이메일 등 계정 정보를 직접 변경할 수 있습니다.
          </li>
          <li>
            <strong>삭제:</strong> 개별 분석 기록·다이어리 항목을 삭제하거나 계정 전체를 탈퇴할 수 있습니다.
          </li>
          <li>
            <strong>비공개 전환:</strong> 공개 다이어리를 비공개로 변경할 수 있습니다.
          </li>
        </ul>

        <h2>8. AI 분석 관련 고지</h2>
        <p>
          서비스가 제공하는 모든 AI 분석 결과는 <strong>참고용 정보</strong>이며,
          의료 진단을 대체하지 않습니다. 두피 상태에 대한 정확한 진단은 반드시 전문의와 상담하시기 바랍니다.
        </p>
        <p>
          등급 4~5에 해당하는 분석 결과가 나올 경우 전문의 상담을 권유하는 안내가 표시됩니다.
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
