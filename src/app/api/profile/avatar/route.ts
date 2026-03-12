import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit/memory";
import { stripExifAndResize } from "@/lib/image/exif";
import { validateMagicBytes } from "@/lib/image/validate";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** POST /api/profile/avatar — 프로필 사진 업로드 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const rl = checkRateLimit(`avatar:${user.id}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "이미지 파일이 필요해요." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "JPEG, PNG, WebP 형식만 지원해요." },
        { status: 400 },
      );
    }

    if (file.size > MAX_AVATAR_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 해요." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Magic bytes 검증
    const magicResult = validateMagicBytes(arrayBuffer, file.type);
    if (!magicResult.valid) {
      return NextResponse.json(
        { error: "올바른 이미지 파일이 아니에요." },
        { status: 400 },
      );
    }

    // EXIF 제거 + 리사이즈 (최대 512x512)
    const processed = await stripExifAndResize(buffer, {
      maxWidth: 512,
      maxHeight: 512,
    });

    // Storage 업로드
    const storagePath = `avatars/${user.id}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("scans")
      .upload(storagePath, processed, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.error("[avatar upload] Storage error:", uploadError);
      return NextResponse.json(
        { error: "사진 업로드에 실패했어요." },
        { status: 500 },
      );
    }

    // Public URL 가져오기
    const { data: urlData } = supabase.storage
      .from("scans")
      .getPublicUrl(storagePath);

    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // DB 업데이트
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("[avatar upload] DB update error:", updateError);
      return NextResponse.json(
        { error: "프로필 업데이트에 실패했어요." },
        { status: 500 },
      );
    }

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error("[POST /api/profile/avatar] Error:", error);
    return NextResponse.json(
      { error: "프로필 사진 업로드 중 문제가 발생했어요." },
      { status: 500 },
    );
  }
}
