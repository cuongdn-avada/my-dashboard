"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomerStat } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { Crown, Medal, Award } from "lucide-react";

interface TopCustomersProps {
  customers: CustomerStat[];
}

const rankIcons = [Crown, Medal, Award];
const rankColors = [
  "text-yellow-500",
  "text-gray-400",
  "text-amber-700",
];

export function TopCustomers({ customers }: TopCustomersProps) {
  return (
    <Card className="col-span-full lg:col-span-1">
      <CardHeader>
        <CardTitle>Top khách hàng</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {customers.map((customer, index) => {
            const RankIcon = rankIcons[index];
            return (
              <div
                key={customer.name}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold">
                    {RankIcon ? (
                      <RankIcon className={`h-4 w-4 ${rankColors[index]}`} />
                    ) : (
                      <span className="text-muted-foreground">{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {customer.orderCount} đơn
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(customer.totalSpent)}
                </Badge>
              </div>
            );
          })}
          {customers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Chưa có dữ liệu
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
