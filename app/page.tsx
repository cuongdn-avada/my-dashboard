import { fetchAllSheets } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

// Revalidate every hour (3600 seconds) - Next.js ISR
export const revalidate = 3600;

export default async function DashboardPage() {
  const { orders, sheets } = await fetchAllSheets();

  return (
    <DashboardClient
      orders={orders}
      sheets={sheets}
      lastSync={new Date().toISOString()}
    />
  );
}
