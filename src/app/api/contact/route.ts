import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const CONTACT_FROM = "noreply@alopedia.app";
const CONTACT_TO = "pediaalo@gmail.com";

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY);
}

interface ContactBody {
  subject: string;
  content: string;
  email: string;
}

/** POST /api/contact — 문의 접수 */
export async function POST(request: NextRequest): Promise<NextResponse> {
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

  const { error } = await getResend().emails.send({
    from: `Alopedia 문의 <${CONTACT_FROM}>`,
    to: CONTACT_TO,
    replyTo: email.trim(),
    subject: `[문의] ${subject.trim()}`,
    text: [
      `보낸 사람: ${email.trim()}`,
      `유저 ID: ${user?.id ?? "비회원"}`,
      "",
      content.trim(),
    ].join("\n"),
  });

  if (error) {
    console.error("[POST /api/contact] Resend error:", error);
    return NextResponse.json({ error: "문의 전송에 실패했어요. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
