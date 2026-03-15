import type { SupabaseClient } from "@supabase/supabase-js";
import { getExpForNextLevel } from "@/lib/utils/level";

const MAX_LEVEL = 99;

/** Grant EXP to a user and handle level-ups */
export async function grantExp(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
): Promise<{ level: number; exp: number; leveledUp: boolean } | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("level, exp")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  let level = profile.level;
  let exp = profile.exp + amount;
  const originalLevel = level;

  while (level < MAX_LEVEL) {
    const needed = getExpForNextLevel(level);
    if (exp >= needed) {
      exp -= needed;
      level += 1;
    } else {
      break;
    }
  }

  await supabase
    .from("profiles")
    .update({ level, exp })
    .eq("id", userId);

  return { level, exp, leveledUp: level > originalLevel };
}
