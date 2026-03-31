import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapDiaryEntry, mapAnalysis } from "@/lib/utils/mapDiaryEntry";

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

  // Increment view count (fire-and-forget)
  await supabase.rpc("increment_view_count", { entry_id: id }).then(null, () => {
    // Fallback: direct update if RPC doesn't exist
    supabase
      .from("diary_entries")
      .update({ view_count: (entry.view_count ?? 0) + 1 })
      .eq("id", id)
      .then(null, () => {});
  });

  // Check if current user liked this entry
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();
  let liked = false;
  if (currentUser) {
    const { data: likeRow } = await supabase
      .from("diary_likes")
      .select("id")
      .eq("entry_id", id)
      .eq("user_id", currentUser.id)
      .maybeSingle();
    liked = !!likeRow;
  }

  const mapped = mapDiaryEntry(entry as unknown as Record<string, unknown>);
  if (analysis) {
    mapped.analysis = mapAnalysis(analysis as unknown as Record<string, unknown>) ?? undefined;
  }

  return NextResponse.json({
    entry: mapped,
    analysis: mapAnalysis(analysis as unknown as Record<string, unknown>),
    liked,
    stats: {
      viewCount: (entry.view_count ?? 0) + 1,
      likeCount: entry.like_count ?? 0,
      commentCount: entry.comment_count ?? 0,
    },
  });
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
    title?: string;
    memo?: string;
    isPublic?: boolean;
    isPhotoPublic?: boolean;
    blurLevel?: string;
    checklists?: { category: string; item: string; checked: boolean }[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "올바른 요청 형식이 아니에요." }, { status: 400 });
  }

  const { title, memo, isPublic, isPhotoPublic, blurLevel, checklists } = body;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (memo !== undefined) updates.memo = memo;
  if (isPublic !== undefined) updates.is_public = isPublic;
  if (isPhotoPublic !== undefined) updates.is_photo_public = isPhotoPublic;
  if (blurLevel !== undefined) updates.blur_level = blurLevel;

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

  return NextResponse.json({ entry: mapDiaryEntry(entry as unknown as Record<string, unknown>) });
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
