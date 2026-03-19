import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { DbMonthlyReport } from "@/types/report";

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: report, error } = await supabase
    .from("monthly_reports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !report) {
    return NextResponse.json({ report: null });
  }

  return NextResponse.json({ report: report as DbMonthlyReport });
}
