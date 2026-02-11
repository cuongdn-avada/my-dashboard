"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@/lib/types";
import { CurrencyText } from "@/components/ui/currency-text";
import {
  TrendingUp,
  Wallet,
  Clock,
  ShoppingCart,
  Truck,
  CheckCircle2,
} from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats;
}

const cardConfigs = [
  {
    key: "revenue",
    title: "Tổng doanh thu",
    icon: TrendingUp,
    gradient: "from-blue-600 to-indigo-600",
    iconBg: "bg-blue-500/10 dark:bg-blue-400/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    key: "deposit",
    title: "Đã cọc",
    icon: Wallet,
    gradient: "from-emerald-600 to-teal-600",
    iconBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "remaining",
    title: "Còn thu",
    icon: Clock,
    gradient: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/10 dark:bg-amber-400/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    key: "orders",
    title: "Tổng đơn",
    icon: ShoppingCart,
    gradient: "from-violet-600 to-purple-600",
    iconBg: "bg-violet-500/10 dark:bg-violet-400/10",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    key: "shipping",
    title: "Phí ship",
    icon: Truck,
    gradient: "from-rose-500 to-pink-500",
    iconBg: "bg-rose-500/10 dark:bg-rose-400/10",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    key: "completed",
    title: "Hoàn thành",
    icon: CheckCircle2,
    gradient: "from-teal-500 to-cyan-500",
    iconBg: "bg-teal-500/10 dark:bg-teal-400/10",
    iconColor: "text-teal-600 dark:text-teal-400",
  },
];

function getCurrencyValue(key: string, stats: DashboardStats): number | null {
  switch (key) {
    case "revenue": return stats.totalRevenue;
    case "deposit": return stats.totalDeposit;
    case "remaining": return stats.totalRemaining;
    case "shipping": return stats.totalShipping;
    default: return null;
  }
}

function getTextValue(key: string, stats: DashboardStats): string | null {
  switch (key) {
    case "orders": return stats.totalOrders.toLocaleString("vi-VN");
    case "completed": return `${stats.completedOrders}/${stats.totalOrders}`;
    default: return null;
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cardConfigs.map((card) => (
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
                  {getCurrencyValue(card.key, stats) !== null ? (
                    <CurrencyText value={getCurrencyValue(card.key, stats)!} />
                  ) : (
                    getTextValue(card.key, stats)
                  )}
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
  );
}
