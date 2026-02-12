"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerStat } from "@/lib/types";
import { CurrencyText } from "@/components/ui/currency-text";
import { Crown, Medal, Award, Users } from "lucide-react";
import Link from "next/link";

interface TopCustomersProps {
  customers: CustomerStat[];
}

const rankConfig = [
  {
    icon: Crown,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
  },
  {
    icon: Medal,
    color: "text-slate-400",
    bg: "bg-slate-400/10",
    ring: "ring-slate-400/20",
  },
  {
    icon: Award,
    color: "text-orange-600",
    bg: "bg-orange-600/10",
    ring: "ring-orange-600/20",
  },
];

export function TopCustomers({ customers }: TopCustomersProps) {
  return (
    <Card className="col-span-full lg:col-span-1 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Top khách hàng</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Theo tổng chi tiêu
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {customers.map((customer, index) => {
            const config = rankConfig[index];
            const isTop3 = index < 3;
            return (
              <Link
                key={customer.name}
                href={`/customers/${encodeURIComponent(customer.name)}`}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer ${
                  isTop3 ? "bg-muted/50 hover:bg-muted" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      config
                        ? `${config.bg} ${config.color} ring-1 ${config.ring}`
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {config ? (
                      <config.icon className="h-3.5 w-3.5" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-none truncate group-hover:text-primary transition-colors">
                      {customer.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {customer.orderCount} don hang
                    </p>
                  </div>
                </div>
                <CurrencyText
                  value={customer.totalSpent}
                  className="text-sm font-semibold tabular-nums text-foreground shrink-0 ml-2"
                />
              </Link>
            );
          })}
          {customers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Chua co du lieu
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
