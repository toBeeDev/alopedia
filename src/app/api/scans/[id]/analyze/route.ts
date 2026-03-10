import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGeminiModel } from "@/lib/gemini/client";
import { buildAnalysisPrompt } from "@/lib/gemini/prompt";
import { parseGeminiResponse } from "@/lib/gemini/parser";
import { checkRateLimit } from "@/lib/rateLimit/memory";
import type { ScanImage } from "@/types/database";

/** POST /api/scans/:id/analyze — AI 분석 트리거 (server-only) */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id: scanId } = await params;
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  // Rate limit: 3 analyses per minute
  const rl = checkRateLimit(`analyze:${user.id}`, 3, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "분석 요청이 너무 많아요. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  // 스캔 조회 + 소유권 확인
  const { data: scan, error: scanError } = await supabase
    .from("scans")
    .select("*")
    .eq("id", scanId)
    .eq("user_id", user.id)
    .single();

  if (scanError || !scan) {
    return NextResponse.json({ error: "스캔을 찾을 수 없어요." }, { status: 404 });
  }

  if (scan.status === "analyzing") {
    return NextResponse.json({ error: "이미 분석 중이에요." }, { status: 409 });
  }

  if (scan.status === "completed") {
    return NextResponse.json({ error: "이미 분석이 완료됐어요." }, { status: 409 });
  }

  try {
    // 상태를 analyzing으로 업데이트
    await supabase
      .from("scans")
      .update({ status: "analyzing" })
      .eq("id", scanId);

    // 이미지 URL에서 base64 변환
    const images = scan.images as ScanImage[];
    const imageParts = await Promise.all(
      images.map(async (img: ScanImage) => {
        const response = await fetch(img.url);
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return {
          inlineData: {
            data: base64,
            mimeType: "image/jpeg",
          },
        };
      }),
    );

    // Gemini Vision API 호출
    const model = getGeminiModel();
    const prompt = buildAnalysisPrompt();

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();

    // 응답 파싱 + 검증
    const analysisResult = parseGeminiResponse(responseText);

    // analyses 테이블에 저장 (service_role이 필요하므로 RLS 우회)
    // 현재는 anon key로 진행 — production에서는 service_role 사용
    const { data: analysis, error: analysisError } = await supabase
      .from("analyses")
      .insert({
        scan_id: scanId,
        norwood_grade: analysisResult.norwoodGrade,
        score: analysisResult.score,
        details: {
          hairline: analysisResult.hairline,
          density: analysisResult.density,
          thickness: analysisResult.thickness,
          scalpCondition: analysisResult.scalpCondition,
          advice: analysisResult.advice,
        },
        gemini_raw_response: JSON.parse(JSON.stringify(result.response)),
        model_version: "gemini-2.0-flash",
      })
      .select()
      .single();

    if (analysisError) {
      await supabase
        .from("scans")
        .update({ status: "failed" })
        .eq("id", scanId);
      return NextResponse.json(
        { error: "분석 결과 저장에 실패했어요." },
        { status: 500 },
      );
    }

    // 상태를 completed로 업데이트
    await supabase
      .from("scans")
      .update({ status: "completed" })
      .eq("id", scanId);

    return NextResponse.json({ analysis });
  } catch {
    await supabase
      .from("scans")
      .update({ status: "failed" })
      .eq("id", scanId);

    return NextResponse.json(
      { error: "AI 분석 중 문제가 발생했어요. 다시 시도해주세요." },
      { status: 500 },
    );
  }
}
