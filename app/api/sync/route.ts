import { NextRequest, NextResponse } from "next/server";
import { fetchAllSheets, saveOrders } from "@/lib/data";
import type { SyncResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

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
    const { orders, sheets } = await fetchAllSheets();
    await saveOrders(orders, sheets);

    const result: SyncResult = {
      success: true,
      orderCount: orders.length,
      lastSync: new Date().toISOString(),
    };

    return NextResponse.json({ ...result, sheets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const result: SyncResult = {
      success: false,
      orderCount: 0,
      lastSync: new Date().toISOString(),
      error: message,
    };

    return NextResponse.json(result, { status: 500 });
  }
}
