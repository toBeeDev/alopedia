import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { validateImageFile } from "@/lib/image/validate";
import { stripExifAndResize, verifyExifRemoved, getImageMetadata } from "@/lib/image/exif";
import { createThumbnail } from "@/lib/image/resize";
import { validateResolution } from "@/lib/image/validate";
import type { ScanImage } from "@/types/database";

/** POST /api/scans — 스캔 세션 생성 + 이미지 업로드 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  // 인증 확인
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const scanImages: ScanImage[] = [];

    // photo_0, photo_1, ... 순서로 업로드된 이미지 수집
    const presentKeys = Array.from(formData.keys())
      .filter((k) => k.startsWith("photo_") && formData.get(k) instanceof File)
      .sort((a, b) => {
        const ai = parseInt(a.split("_")[1], 10);
        const bi = parseInt(b.split("_")[1], 10);
        return ai - bi;
      });

    if (presentKeys.length === 0) {
      return NextResponse.json(
        { error: "최소 1장의 사진이 필요해요." },
        { status: 400 },
      );
    }

    for (const type of presentKeys) {
      const file = formData.get(type) as File;

      // 파일 검증
      const arrayBuffer = await file.arrayBuffer();
      const validation = await validateImageFile(
        arrayBuffer,
        file.type,
        file.name,
      );
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // 해상도 검증 (원본 기준, 리사이즈 전)
      const rawBuffer = Buffer.from(arrayBuffer);
      const rawMeta = await getImageMetadata(rawBuffer);
      const resolutionCheck = validateResolution(rawMeta.width, rawMeta.height);

      // EXIF 스트리핑 + 리사이즈
      const processedBuffer = await stripExifAndResize(rawBuffer);

      // EXIF 제거 검증
      const exifClean = await verifyExifRemoved(processedBuffer);
      if (!exifClean) {
        return NextResponse.json(
          { error: "이미지 처리 중 문제가 발생했어요. 다시 시도해주세요." },
          { status: 500 },
        );
      }
      if (!resolutionCheck.valid) {
        return NextResponse.json({ error: resolutionCheck.error }, { status: 400 });
      }

      // 썸네일 생성
      const thumbnailBuffer = await createThumbnail(processedBuffer);

      // UUID 파일명으로 업로드
      const fileId = randomUUID();
      const imagePath = `${user.id}/${fileId}.jpg`;
      const thumbPath = `${user.id}/${fileId}_thumb.jpg`;

      const [imageUpload, thumbUpload] = await Promise.all([
        supabase.storage
          .from("scans")
          .upload(imagePath, processedBuffer, {
            contentType: "image/jpeg",
            upsert: false,
          }),
        supabase.storage
          .from("scans")
          .upload(thumbPath, thumbnailBuffer, {
            contentType: "image/jpeg",
            upsert: false,
          }),
      ]);

      if (imageUpload.error || thumbUpload.error) {
        return NextResponse.json(
          { error: "이미지 업로드에 실패했어요. 다시 시도해주세요." },
          { status: 500 },
        );
      }

      const {
        data: { publicUrl: imageUrl },
      } = supabase.storage.from("scans").getPublicUrl(imagePath);
      const {
        data: { publicUrl: thumbnailUrl },
      } = supabase.storage.from("scans").getPublicUrl(thumbPath);

      scanImages.push({
        type,
        url: imageUrl,
        thumbnailUrl,
      });
    }

    // 스캔 레코드 생성
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .insert({
        user_id: user.id,
        images: scanImages,
        status: "pending",
      })
      .select()
      .single();

    if (scanError) {
      return NextResponse.json(
        { error: "스캔 기록 저장에 실패했어요." },
        { status: 500 },
      );
    }

    return NextResponse.json({ scan }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/scans] Unhandled error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했어요. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }
}

/** GET /api/scans — 내 스캔 히스토리 */
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { data: scans, error } = await supabase
    .from("scans")
    .select("*, analyses(*)")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "기록을 불러올 수 없어요." }, { status: 500 });
  }

  return NextResponse.json({ scans });
}
