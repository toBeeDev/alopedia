import { NextResponse, type NextRequest } from "next/server";
import { getGeminiModel } from "@/lib/gemini/client";
import { buildAnalysisPrompt } from "@/lib/gemini/prompt";
import { parseGeminiResponse } from "@/lib/gemini/parser";
import { stripExifAndResize } from "@/lib/image/exif";
import { validateImageFile } from "@/lib/image/validate";
import { checkRateLimit } from "@/lib/rateLimit/memory";

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Get IP for rate limiting
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  // Rate limit: 1 per 24 hours per IP
  const rl = checkRateLimit(`guest:${ip}`, 1, 24 * 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error:
          "무료 체험은 24시간에 1회만 가능해요. 회원가입하면 매일 분석할 수 있어요!",
      },
      { status: 429 },
    );
  }

  try {
    const formData = await request.formData();

    // Collect images (minimum 3)
    const imageEntries: File[] = [];
    for (let i = 0; i < 6; i++) {
      const file = formData.get(`photo_${i}`);
      if (file instanceof File) imageEntries.push(file);
    }

    if (imageEntries.length < 3) {
      return NextResponse.json(
        { error: "최소 3장의 사진이 필요해요." },
        { status: 400 },
      );
    }

    // Validate and process each image
    const imageParts = await Promise.all(
      imageEntries.map(async (file) => {
        // Full validation pipeline
        const buffer = await file.arrayBuffer();
        const validationResult = await validateImageFile(
          buffer,
          file.type,
          file.name,
        );
        if (!validationResult.valid) {
          throw new Error(validationResult.error ?? "이미지 검증에 실패했어요.");
        }

        // Strip EXIF + resize
        const processed = await stripExifAndResize(Buffer.from(buffer));
        const base64 = processed.toString("base64");

        return {
          inlineData: {
            data: base64,
            mimeType: "image/jpeg" as const,
          },
        };
      }),
    );

    // Call Gemini (no previous analysis for guest)
    const model = getGeminiModel();
    const prompt = buildAnalysisPrompt();
    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    const analysisResult = parseGeminiResponse(responseText);

    return NextResponse.json({
      analysis: {
        norwoodGrade: analysisResult.norwoodGrade,
        score: analysisResult.score,
        details: {
          hairline: analysisResult.hairline,
          density: analysisResult.density,
          thickness: analysisResult.thickness,
          scalpCondition: analysisResult.scalpCondition,
          advice: analysisResult.advice,
          areaScores: analysisResult.areaScores,
          photoClassification: undefined,
        },
      },
    });
  } catch (error) {
    console.error("[POST /api/guest/analyze] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "분석 중 문제가 발생했어요.",
      },
      { status: 500 },
    );
  }
}
