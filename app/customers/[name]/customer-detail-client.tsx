"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderTable } from "@/components/dashboard/order-table";
import { CurrencyText } from "@/components/ui/currency-text";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import type { Order } from "@/lib/types";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Wallet,
  Clock,
  ShoppingCart,
  Truck,
  CheckCircle2,
} from "lucide-react";

interface CustomerDetailClientProps {
  customerName: string;
  orders: Order[];
}

const statConfigs = [
  { key: "revenue", title: "Tong chi tieu", icon: TrendingUp, gradient: "from-blue-600 to-indigo-600", iconBg: "bg-blue-500/10 dark:bg-blue-400/10", iconColor: "text-blue-600 dark:text-blue-400" },
  { key: "deposit", title: "Da coc", icon: Wallet, gradient: "from-emerald-600 to-teal-600", iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10", iconColor: "text-emerald-600 dark:text-emerald-400" },
  { key: "remaining", title: "Con thu", icon: Clock, gradient: "from-amber-500 to-orange-500", iconBg: "bg-amber-500/10 dark:bg-amber-400/10", iconColor: "text-amber-600 dark:text-amber-400" },
  { key: "orders", title: "Tong don", icon: ShoppingCart, gradient: "from-violet-600 to-purple-600", iconBg: "bg-violet-500/10 dark:bg-violet-400/10", iconColor: "text-violet-600 dark:text-violet-400" },
  { key: "shipping", title: "Phi ship", icon: Truck, gradient: "from-rose-500 to-pink-500", iconBg: "bg-rose-500/10 dark:bg-rose-400/10", iconColor: "text-rose-600 dark:text-rose-400" },
  { key: "completed", title: "Hoan thanh", icon: CheckCircle2, gradient: "from-teal-500 to-cyan-500", iconBg: "bg-teal-500/10 dark:bg-teal-400/10", iconColor: "text-teal-600 dark:text-teal-400" },
];

export function CustomerDetailClient({ customerName, orders }: CustomerDetailClientProps) {
  const stats = useMemo(() => ({
    totalRevenue: orders.reduce((s, o) => s + o.total, 0),
    totalDeposit: orders.reduce((s, o) => s + o.deposit, 0),
    totalRemaining: orders.reduce((s, o) => s + o.remaining, 0),
    totalOrders: orders.length,
    totalShipping: orders.reduce((s, o) => s + o.shipping, 0),
    completedOrders: orders.filter((o) => o.status === "xong" || o.status === "done" || o.status === "đã lên đơn").length,
  }), [orders]);

  function renderValue(key: string) {
    switch (key) {
      case "revenue": return <CurrencyText value={stats.totalRevenue} />;
      case "deposit": return <CurrencyText value={stats.totalDeposit} />;
      case "remaining": return <CurrencyText value={stats.totalRemaining} />;
      case "orders": return stats.totalOrders.toLocaleString("vi-VN");
      case "shipping": return <CurrencyText value={stats.totalShipping} />;
      case "completed": return `${stats.completedOrders}/${stats.totalOrders}`;
      default: return "0";
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/25">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none tracking-tight">{customerName}</h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Chi tiet khach hang
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="space-y-5">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Khong tim thay don hang cua khach hang nay
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
                {statConfigs.map((card) => (
                  <Card
                    key={card.key}
                    className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-0.5"
                  >
                    <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${card.gradient} opacity-80`} />
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                            {card.title}
                          </p>
                          <p className="text-xl font-bold tracking-tight sm:text-2xl">
                            {renderValue(card.key)}
                          </p>
                        </div>
                        <div className={`rounded-xl p-2.5 ${card.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                          <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <OrderTable orders={orders} />
            </>
          )}
        </div>
      </main>

      <footer className="border-t py-4 mt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] text-muted-foreground/60">
            Order Dashboard &mdash; {customerName}
          </p>
        </div>
      </footer>
    </div>
  );
}
