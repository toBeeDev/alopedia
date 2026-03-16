import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { validateImageFile } from "@/lib/image/validate";
import { stripExifAndResize } from "@/lib/image/exif";
import { createThumbnail } from "@/lib/image/resize";

const MAX_IMAGES = 5;

/** POST /api/board/images — 게시글 이미지 업로드 (최대 5장) */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "최소 1장의 사진이 필요해요." },
        { status: 400 },
      );
    }
    if (files.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있어요.` },
        { status: 400 },
      );
    }

    const uploadedImages: { url: string; thumbnailUrl: string }[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const validation = await validateImageFile(
        arrayBuffer,
        file.type,
        file.name,
      );
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const rawBuffer = Buffer.from(arrayBuffer);
      const processedBuffer = await stripExifAndResize(rawBuffer, {
        maxWidth: 1280,
        maxHeight: 1280,
      });
      const thumbnailBuffer = await createThumbnail(processedBuffer);

      const fileId = randomUUID();
      const imagePath = `board/${user.id}/${fileId}.jpg`;
      const thumbPath = `board/${user.id}/${fileId}_thumb.jpg`;

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
          { error: "이미지 업로드에 실패했어요." },
          { status: 500 },
        );
      }

      const { data: { publicUrl: url } } = supabase.storage
        .from("scans")
        .getPublicUrl(imagePath);
      const { data: { publicUrl: thumbnailUrl } } = supabase.storage
        .from("scans")
        .getPublicUrl(thumbPath);

      uploadedImages.push({ url, thumbnailUrl });
    }

    return NextResponse.json({ images: uploadedImages }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/board/images] Error:", error);
    return NextResponse.json(
      { error: "이미지 업로드 중 오류가 발생했어요." },
      { status: 500 },
    );
  }
}
