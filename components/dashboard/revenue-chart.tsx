"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyRevenue } from "@/lib/types";
import { formatShortDate, formatCurrencyParts } from "@/lib/format";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface RevenueChartProps {
  dailyRevenue: DailyRevenue[];
  monthlyRevenue: DailyRevenue[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border bg-card/95 backdrop-blur-sm p-3 shadow-xl shadow-black/10">
      <p className="text-xs font-semibold text-foreground mb-1.5">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <p className="text-xs text-muted-foreground">
            Doanh thu:{" "}
            <span
              className="font-semibold text-foreground"
              title={formatCurrencyParts(payload[0].value).fullVND}
            >
              {formatCurrencyParts(payload[0].value).display}
            </span>
          </p>
        </div>
        {payload[1] && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-violet-500" />
            <p className="text-xs text-muted-foreground">
              Don hang:{" "}
              <span className="font-semibold text-foreground">
                {payload[1].value}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function RevenueChart({
  dailyRevenue,
  monthlyRevenue,
}: RevenueChartProps) {
  const [view, setView] = useState<"daily" | "monthly">("daily");
  const data = view === "daily" ? dailyRevenue : monthlyRevenue;

  const chartData = data.map((d) => ({
    ...d,
    displayDate: view === "daily" ? formatShortDate(d.date) : d.date,
  }));

  return (
    <Card className="col-span-full lg:col-span-2 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">
              Doanh thu theo thời gian
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {chartData.length} {view === "daily" ? "ngay" : "thang"}
            </p>
          </div>
        </div>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "daily" | "monthly")}
        >
          <TabsList className="h-8">
            <TabsTrigger value="daily" className="text-xs px-3 cursor-pointer">
              Ngày
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="text-xs px-3 cursor-pointer"
            >
              Tháng
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {view === "daily" ? (
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="oklch(0.55 0.2 260)"
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.55 0.2 260)"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.5 0 0 / 0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 10, fill: "oklch(0.5 0.02 260)" }}
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={55}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "oklch(0.5 0.02 260)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(0.55 0.2 260)"
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    strokeWidth: 2,
                    fill: "oklch(0.55 0.2 260)",
                  }}
                />
              </AreaChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor="oklch(0.55 0.2 260)"
                      stopOpacity={0.9}
                    />
                    <stop
                      offset="100%"
                      stopColor="oklch(0.55 0.2 260)"
                      stopOpacity={0.5}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(0.5 0 0 / 0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fontSize: 11, fill: "oklch(0.5 0.02 260)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "oklch(0.5 0.02 260)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="revenue"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
