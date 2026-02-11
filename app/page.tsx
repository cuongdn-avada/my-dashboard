import { loadOrders, getLastSync, computeStats, computeTopCustomers, computeDailyRevenue, computeMonthlyRevenue } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const orders = await loadOrders();
  const meta = await getLastSync();

  const stats = computeStats(orders);
  const topCustomers = computeTopCustomers(orders, 8);
  const dailyRevenue = computeDailyRevenue(orders);
  const monthlyRevenue = computeMonthlyRevenue(orders);

  return (
    <DashboardClient
      orders={orders}
      stats={stats}
      topCustomers={topCustomers}
      dailyRevenue={dailyRevenue}
      monthlyRevenue={monthlyRevenue}
      lastSync={meta?.lastSync ?? null}
    />
  );
}
