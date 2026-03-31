import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Validate redirect path to prevent open redirect attacks */
function safeRedirectPath(path: string): string {
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.startsWith("/\\") ||
    path.includes(":")
  ) {
    return "/dashboard";
  }
  return path;
}

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeRedirectPath(searchParams.get("next") ?? "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const user = sessionData.user;
      if (user) {
        await supabase
          .from("profiles")
          .update({ terms_agreed_at: new Date().toISOString() })
          .eq("id", user.id)
          .is("terms_agreed_at", null);
      }
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
