import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGeminiModel } from "@/lib/gemini/client";
import { buildAnalysisPrompt } from "@/lib/gemini/prompt";
import { parseGeminiResponse } from "@/lib/gemini/parser";
import { checkRateLimit } from "@/lib/rateLimit/memory";
import { grantExp } from "@/lib/utils/grantExp";
import { EXP_REWARDS } from "@/lib/utils/level";
import { blurOutsideRegion } from "@/lib/image/blur";
import type { ScanImage, AnalysisDetail } from "@/types/database";

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

  // Rate limit: 3 analyses per minute (burst protection)
  const rl = checkRateLimit(`analyze:${user.id}`, 3, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "분석 요청이 너무 많아요. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  // Daily limit: 최대 2회/일 (개발/preview 환경에서는 무제한)
  const isDev = process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { error: countError } = await supabase
    .from("analyses")
    .select("id", { count: "exact", head: true })
    .eq("scan_id", scanId)
    .gte("created_at", todayStart.toISOString());

  // scan_id 기준이 아닌 user 기준으로 하루 전체 분석 횟수 체크
  const { count: dailyUserCount } = await supabase
    .from("scans")
    .select("id, analyses!inner(id)", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("analyses.created_at", todayStart.toISOString());

  if (!isDev && !countError && (dailyUserCount ?? 0) >= 2) {
    return NextResponse.json(
      {
        error: "오늘 분석 횟수(2회)를 모두 사용했어요. 내일 다시 시도해주세요.",
        code: "DAILY_LIMIT_REACHED",
        remaining: 0,
      },
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
    // 재시도 시 이전 실패 analysis 레코드 삭제
    if (scan.status === "failed") {
      await supabase
        .from("analyses")
        .delete()
        .eq("scan_id", scanId);
    }

    // 상태를 analyzing으로 업데이트
    await supabase
      .from("scans")
      .update({ status: "analyzing" })
      .eq("id", scanId);

    // 이미지 URL에서 base64 변환
    const images = scan.images as ScanImage[];
    console.log("[analyze] Fetching", images.length, "images");
    const imageParts = await Promise.all(
      images.map(async (img: ScanImage) => {
        const response = await fetch(img.url);
        if (!response.ok) {
          throw new Error(`Image fetch failed: ${img.url} (${response.status})`);
        }
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

    // 이전 분석 조회 (시계열 비교용)
    const { data: previousAnalyses } = await supabase
      .from("analyses")
      .select("norwood_grade, score, details, scan_id, scans!inner(user_id)")
      .eq("scans.user_id", user.id)
      .neq("scan_id", scanId)
      .order("created_at", { ascending: false })
      .limit(1);

    const prevAnalysis = previousAnalyses?.[0];
    const previousAnalysisContext = prevAnalysis
      ? {
          grade: prevAnalysis.norwood_grade as number,
          score: Number(prevAnalysis.score),
          hairline: (prevAnalysis.details as AnalysisDetail).hairline,
          density: (prevAnalysis.details as AnalysisDetail).density,
        }
      : undefined;

    // Gemini Vision API 호출
    console.log("[analyze] Calling Gemini API...");
    const model = getGeminiModel();
    const prompt = buildAnalysisPrompt(previousAnalysisContext);

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    console.log("[analyze] Gemini response length:", responseText.length);

    // 응답 파싱 + 검증
    const analysisResult = parseGeminiResponse(responseText);
    console.log("[analyze] Parsed grade:", analysisResult.norwoodGrade, "score:", analysisResult.score);

    // analyses 테이블에 저장
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
          ...(analysisResult.comparison ? { comparison: analysisResult.comparison } : {}),
          areaScores: analysisResult.areaScores,
        },
        gemini_raw_response: responseText,
        model_version: "gemini-2.5-flash",
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

    // 프라이버시 blur 처리: 두피 영역 외 blur 후 Storage 교체
    if (analysisResult.scalpRegions.length > 0) {
      console.log("[analyze] Applying privacy blur to", analysisResult.scalpRegions.length, "regions");
      await Promise.all(
        images.map(async (img: ScanImage, idx: number) => {
          const region = analysisResult.scalpRegions.find((r) => r.imageIndex === idx);
          if (!region) return;

          // 원본 이미지 fetch
          const res = await fetch(img.url);
          if (!res.ok) return;
          const originalBuffer = Buffer.from(await res.arrayBuffer());

          // blur 처리
          const blurredBuffer = await blurOutsideRegion(originalBuffer, region);

          // Storage 경로 추출 (publicUrl에서 path 부분)
          const urlObj = new URL(img.url);
          const pathMatch = urlObj.pathname.match(/\/object\/public\/scans\/(.+)/);
          if (!pathMatch) return;
          const storagePath = pathMatch[1];

          // 썸네일도 blur 처리
          const thumbUrlObj = new URL(img.thumbnailUrl);
          const thumbMatch = thumbUrlObj.pathname.match(/\/object\/public\/scans\/(.+)/);

          // 원본 교체 (upsert)
          await supabase.storage
            .from("scans")
            .update(storagePath, blurredBuffer, {
              contentType: "image/jpeg",
              upsert: true,
            });

          // 썸네일도 교체
          if (thumbMatch) {
            const { createThumbnail } = await import("@/lib/image/resize");
            const blurredThumb = await createThumbnail(blurredBuffer);
            await supabase.storage
              .from("scans")
              .update(thumbMatch[1], blurredThumb, {
                contentType: "image/jpeg",
                upsert: true,
              });
          }
        }),
      );
    }

    // 상태를 completed로 업데이트
    await supabase
      .from("scans")
      .update({ status: "completed" })
      .eq("id", scanId);

    // Grant EXP for completed scan
    await grantExp(supabase, user.id, EXP_REWARDS.SCAN_COMPLETED);

    const dailyRemaining = Math.max(0, 2 - ((dailyUserCount ?? 0) + 1));
    return NextResponse.json({ analysis, dailyRemaining });
  } catch (error) {
    console.error("[POST /api/scans/:id/analyze] Error:", error);
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
