import { loadOrders, getMeta } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const orders = await loadOrders();
  const meta = await getMeta();

  return (
    <DashboardClient
      orders={orders}
      sheets={meta?.sheets ?? []}
      lastSync={meta?.lastSync ?? null}
    />
  );
}
