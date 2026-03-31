import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const PAGE_SIZE = 20;

/** GET /api/diary/entries — 목록 조회 (공개 피드 또는 내 일기) */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const isPublic = searchParams.get("public") === "true";
  const month = searchParams.get("month"); // YYYY-MM
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const offset = (page - 1) * PAGE_SIZE;

  if (isPublic) {
    // 공개 피드: 인증 불필요, 페이지네이션 적용
    const { data: entries, error } = await supabase
      .from("diary_entries")
      .select(
        "*, scans(images, status), profiles!diary_entries_user_id_fkey(nickname, avatar_seed), diary_checklists(*)",
      )
      .eq("is_public", true)
      .order("date", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("[GET /api/diary/entries] public feed error:", error);
      return NextResponse.json({ error: "피드를 불러올 수 없어요." }, { status: 500 });
    }

    return NextResponse.json({ entries, page, pageSize: PAGE_SIZE });
  }

  // 내 일기: 인증 필요
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  let query = supabase
    .from("diary_entries")
    .select("*, scans(images, status), diary_checklists(*)")
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (month) {
    // month 필터: YYYY-MM → YYYY-MM-01 ~ YYYY-MM-31 범위
    const from = `${month}-01`;
    const [year, mon] = month.split("-").map(Number);
    const lastDay = new Date(year, mon, 0).getDate();
    const to = `${month}-${String(lastDay).padStart(2, "0")}`;
    query = query.gte("date", from).lte("date", to);
  }

  const { data: entries, error } = await query;

  if (error) {
    console.error("[GET /api/diary/entries] own entries error:", error);
    return NextResponse.json({ error: "일기를 불러올 수 없어요." }, { status: 500 });
  }

  return NextResponse.json({ entries });
}

/** POST /api/diary/entries — 일기 생성 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요." }, { status: 401 });
  }

  let body: {
    scanId?: string;
    date: string;
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

  const { scanId, date, memo, isPublic, isPhotoPublic, checklists } = body;

  // 날짜 형식 검증 (YYYY-MM-DD)
  if (!date || !DATE_REGEX.test(date)) {
    return NextResponse.json(
      { error: "날짜 형식이 올바르지 않아요. YYYY-MM-DD 형식으로 입력해주세요." },
      { status: 400 },
    );
  }

  // 중복 체크 (user_id + date unique)
  const { data: existing, error: dupError } = await supabase
    .from("diary_entries")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", date)
    .maybeSingle();

  if (dupError) {
    console.error("[POST /api/diary/entries] duplicate check error:", dupError);
    return NextResponse.json({ error: "서버 오류가 발생했어요. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json(
      { error: "해당 날짜의 일기가 이미 존재해요." },
      { status: 409 },
    );
  }

  // 일기 생성
  const { data: entry, error: insertError } = await supabase
    .from("diary_entries")
    .insert({
      user_id: user.id,
      scan_id: scanId ?? null,
      date,
      memo: memo ?? null,
      is_public: isPublic ?? false,
      is_photo_public: isPhotoPublic ?? false,
    })
    .select()
    .single();

  if (insertError || !entry) {
    console.error("[POST /api/diary/entries] insert error:", insertError);
    return NextResponse.json({ error: "일기 저장에 실패했어요." }, { status: 500 });
  }

  // 체크리스트 삽입
  if (checklists && checklists.length > 0) {
    const checklistRows = checklists.map((c) => ({
      entry_id: entry.id,
      category: c.category,
      item: c.item,
      checked: c.checked,
    }));

    const { error: checklistError } = await supabase
      .from("diary_checklists")
      .insert(checklistRows);

    if (checklistError) {
      console.error("[POST /api/diary/entries] checklist insert error:", checklistError);
      // 체크리스트 실패해도 일기는 반환 (부분 성공 허용)
    }
  }

  return NextResponse.json({ entry }, { status: 201 });
}
