import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Allow if no secret is set, or if secret matches
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return syncData();
}

export async function POST() {
  return syncData();
}

async function syncData() {
  try {
    // Revalidate the homepage - Next.js will re-fetch data from Google Sheets
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      lastSync: new Date().toISOString(),
      message: "Cache invalidated. Page will fetch fresh data on next visit.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
