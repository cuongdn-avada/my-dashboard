"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { StatsCards } from "./stats-cards";
import { RevenueChart } from "./revenue-chart";
import { TopCustomers } from "./top-customers";
import { OrderTable } from "./order-table";
import { SyncButton } from "./sync-button";
import { SheetSelector } from "./sheet-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import type { Order, DashboardStats, CustomerStat, DailyRevenue } from "@/lib/types";
import { BarChart3 } from "lucide-react";

interface DashboardClientProps {
  orders: Order[];
  sheets: string[];
  lastSync: string | null;
}

function computeStats(orders: Order[]): DashboardStats {
  return {
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    totalDeposit: orders.reduce((sum, o) => sum + o.deposit, 0),
    totalRemaining: orders.reduce((sum, o) => sum + o.remaining, 0),
    totalOrders: orders.length,
    totalShipping: orders.reduce((sum, o) => sum + o.shipping, 0),
    completedOrders: orders.filter((o) => o.status === "xong" || o.status === "done" || o.status === "đã lên đơn").length,
  };
}

function computeTopCustomers(orders: Order[], limit: number = 10): CustomerStat[] {
  const map = new Map<string, CustomerStat>();
  for (const order of orders) {
    if (!order.customerName) continue;
    const existing = map.get(order.customerName);
    if (existing) {
      existing.totalSpent += order.total;
      existing.orderCount += 1;
    } else {
      map.set(order.customerName, { name: order.customerName, totalSpent: order.total, orderCount: 1 });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, limit);
}

function computeDailyRevenue(orders: Order[]): DailyRevenue[] {
  const map = new Map<string, DailyRevenue>();
  for (const order of orders) {
    if (!order.date) continue;
    const existing = map.get(order.date);
    if (existing) { existing.revenue += order.total; existing.orders += 1; }
    else map.set(order.date, { date: order.date, revenue: order.total, orders: 1 });
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function computeMonthlyRevenue(orders: Order[]): DailyRevenue[] {
  const map = new Map<string, DailyRevenue>();
  for (const order of orders) {
    if (!order.date) continue;
    const month = order.date.substring(0, 7);
    const existing = map.get(month);
    if (existing) { existing.revenue += order.total; existing.orders += 1; }
    else map.set(month, { date: month, revenue: order.total, orders: 1 });
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function DashboardClient({ orders, sheets, lastSync }: DashboardClientProps) {
  const router = useRouter();
  const [selectedSheet, setSelectedSheet] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    if (selectedSheet === "all") return orders;
    return orders.filter((o) => o.sheetName === selectedSheet);
  }, [orders, selectedSheet]);

  const stats = useMemo(() => computeStats(filteredOrders), [filteredOrders]);
  const topCustomers = useMemo(() => computeTopCustomers(filteredOrders, 8), [filteredOrders]);
  const dailyRevenue = useMemo(() => computeDailyRevenue(filteredOrders), [filteredOrders]);
  const monthlyRevenue = useMemo(() => computeMonthlyRevenue(filteredOrders), [filteredOrders]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/25">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none tracking-tight">Order Dashboard</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Analytics & Reports
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <SyncButton
              lastSync={lastSync}
              onSyncComplete={() => router.refresh()}
            />
            <Separator orientation="vertical" className="h-5" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="space-y-5">
          {/* Sheet Selector */}
          <SheetSelector
            sheets={sheets}
            selected={selectedSheet}
            onChange={setSelectedSheet}
            orderCount={filteredOrders.length}
            totalCount={orders.length}
          />

          {/* Stats Overview */}
          <StatsCards stats={stats} />

          {/* Charts + Top Customers */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <RevenueChart
              dailyRevenue={dailyRevenue}
              monthlyRevenue={monthlyRevenue}
            />
            <TopCustomers customers={topCustomers} />
          </div>

          {/* Order Table */}
          <OrderTable orders={filteredOrders} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-4 mt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] text-muted-foreground/60">
            Order Dashboard &mdash; Auto-sync every hour from Google Sheets
          </p>
        </div>
      </footer>
    </div>
  );
}
