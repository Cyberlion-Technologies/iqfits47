import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/affiliate";
import { isSupabaseServerConfigured } from "@/lib/supabase/server";

// Cache for 60 seconds — leaderboard doesn't need to be real-time
export const revalidate = 60;

export async function GET() {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Service not configured." }, { status: 503 });
  }

  try {
    const leaderboard = await getLeaderboard();
    return NextResponse.json({ leaderboard });
  } catch (err) {
    console.error("Leaderboard fetch error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Something went wrong." },
      { status: 500 }
    );
  }
}
