import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ContactBody {
  subject: string;
  content: string;
  email: string;
}

/** POST /api/contact — 문의 접수 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Auth is optional — get user if logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  const { subject, content, email } = body as ContactBody;

  // Validate required fields
  if (!subject || !content || !email) {
    return NextResponse.json({ error: "제목, 내용, 이메일은 필수입니다." }, { status: 400 });
  }

  if (typeof subject !== "string" || typeof content !== "string" || typeof email !== "string") {
    return NextResponse.json({ error: "요청 형식이 올바르지 않아요." }, { status: 400 });
  }

  if (subject.trim().length === 0 || content.trim().length === 0 || email.trim().length === 0) {
    return NextResponse.json({ error: "제목, 내용, 이메일을 모두 입력해주세요." }, { status: 400 });
  }

  if (subject.length > 200) {
    return NextResponse.json({ error: "제목은 200자 이하로 입력해주세요." }, { status: 400 });
  }

  if (content.length > 5000) {
    return NextResponse.json({ error: "내용은 5000자 이하로 입력해주세요." }, { status: 400 });
  }

  // TODO: Resend integration
  console.log("[POST /api/contact]", {
    userId: user?.id ?? "anonymous",
    email: email.trim(),
    subject: subject.trim(),
    contentLength: content.length,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
