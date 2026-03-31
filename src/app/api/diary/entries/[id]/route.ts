import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/diary/entries/:id — 일기 상세 조회 (분석 결과 포함) */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: entry, error } = await supabase
    .from("diary_entries")
    .select(
      "*, scans(images, status), profiles!diary_entries_user_id_fkey(nickname, avatar_seed), diary_checklists(*)",
    )
    .eq("id", id)
    .single();

  if (error || !entry) {
    return NextResponse.json({ error: "일기를 찾을 수 없어요." }, { status: 404 });
  }

  // scan_id가 있으면 해당 스캔의 최신 분석 결과 조회
  let analysis = null;
  if (entry.scan_id) {
    const { data: latestAnalysis, error: analysisError } = await supabase
      .from("analyses")
      .select("*")
      .eq("scan_id", entry.scan_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (analysisError) {
      console.error("[GET /api/diary/entries/:id] analysis fetch error:", analysisError);
    } else {
      analysis = latestAnalysis;
    }
  }

  return NextResponse.json({ entry, analysis });
}

/** PATCH /api/diary/entries/:id — 일기 수정 (소유자만) */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  let body: {
    memo?: string;
    isPublic?: boolean;
    isPhotoPublic?: boolean;
    checklists?: { category: string; item: string; checked: boolean }[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "올바른 요청 형식이 아니에요." }, { status: 400 });
  }

  const { memo, isPublic, isPhotoPublic, checklists } = body;

  // 부분 업데이트 필드 구성
  const updates: Record<string, unknown> = {};
  if (memo !== undefined) updates.memo = memo;
  if (isPublic !== undefined) updates.is_public = isPublic;
  if (isPhotoPublic !== undefined) updates.is_photo_public = isPhotoPublic;

  // 소유자 확인 + 업데이트 (user_id 조건 포함)
  const { data: entry, error: updateError } = await supabase
    .from("diary_entries")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError || !entry) {
    if (updateError?.code === "PGRST116") {
      return NextResponse.json(
        { error: "일기를 찾을 수 없거나 수정 권한이 없어요." },
        { status: 404 },
      );
    }
    console.error("[PATCH /api/diary/entries/:id] update error:", updateError);
    return NextResponse.json({ error: "일기 수정에 실패했어요." }, { status: 500 });
  }

  // 체크리스트 교체: 기존 삭제 후 새로 삽입
  if (checklists !== undefined) {
    const { error: deleteError } = await supabase
      .from("diary_checklists")
      .delete()
      .eq("entry_id", id);

    if (deleteError) {
      console.error("[PATCH /api/diary/entries/:id] checklist delete error:", deleteError);
      return NextResponse.json({ error: "체크리스트 업데이트에 실패했어요." }, { status: 500 });
    }

    if (checklists.length > 0) {
      const checklistRows = checklists.map((c) => ({
        entry_id: id,
        category: c.category,
        item: c.item,
        checked: c.checked,
      }));

      const { error: insertError } = await supabase
        .from("diary_checklists")
        .insert(checklistRows);

      if (insertError) {
        console.error("[PATCH /api/diary/entries/:id] checklist insert error:", insertError);
        return NextResponse.json({ error: "체크리스트 저장에 실패했어요." }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ entry });
}

/** DELETE /api/diary/entries/:id — 일기 삭제 (소유자만) */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  const { error } = await supabase
    .from("diary_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[DELETE /api/diary/entries/:id] delete error:", error);
    return NextResponse.json({ error: "일기 삭제에 실패했어요." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
