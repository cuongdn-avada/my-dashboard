"use client";

import { useRouter } from "next/navigation";
import { StatsCards } from "./stats-cards";
import { RevenueChart } from "./revenue-chart";
import { TopCustomers } from "./top-customers";
import { OrderTable } from "./order-table";
import { SyncButton } from "./sync-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import type { Order, DashboardStats, CustomerStat, DailyRevenue } from "@/lib/types";
import { LayoutDashboard } from "lucide-react";

interface DashboardClientProps {
  orders: Order[];
  stats: DashboardStats;
  topCustomers: CustomerStat[];
  dailyRevenue: DailyRevenue[];
  monthlyRevenue: DailyRevenue[];
  lastSync: string | null;
}

export function DashboardClient({
  orders,
  stats,
  topCustomers,
  dailyRevenue,
  monthlyRevenue,
  lastSync,
}: DashboardClientProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-none">Order Dashboard</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Thống kê đơn hàng
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SyncButton
              lastSync={lastSync}
              onSyncComplete={() => router.refresh()}
            />
            <Separator orientation="vertical" className="h-6" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <StatsCards stats={stats} />

        {/* Charts + Top Customers */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <RevenueChart
            dailyRevenue={dailyRevenue}
            monthlyRevenue={monthlyRevenue}
          />
          <TopCustomers customers={topCustomers} />
        </div>

        {/* Order Table */}
        <OrderTable orders={orders} />
      </main>

      {/* Footer */}
      <footer className="border-t py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground">
            Order Dashboard &mdash; Tự động đồng bộ mỗi giờ từ Google Sheets
          </p>
        </div>
      </footer>
    </div>
  );
}
