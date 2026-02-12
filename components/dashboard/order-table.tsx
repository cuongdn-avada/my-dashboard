"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { CurrencyText } from "@/components/ui/currency-text";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  TableIcon,
} from "lucide-react";

interface OrderTableProps {
  orders: Order[];
}

type SortField = "date" | "customerName" | "total" | "remaining" | "status";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 15;

export function OrderTable({ orders }: OrderTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return orders;
    return orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(query) ||
        o.addressPhoneNotes.toLowerCase().includes(query) ||
        o.date.includes(query) ||
        o.notes.toLowerCase().includes(query),
    );
  }, [orders, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "date":
          cmp = a.date.localeCompare(b.date);
          break;
        case "customerName":
          cmp = a.customerName.localeCompare(b.customerName);
          break;
        case "total":
          cmp = a.total - b.total;
          break;
        case "remaining":
          cmp = a.remaining - b.remaining;
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(0);
  }

  function SortButton({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) {
    const isActive = sortField === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1.5 cursor-pointer transition-colors duration-150 ${
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {children}
        <ArrowUpDown
          className={`h-3 w-3 ${isActive ? "opacity-100" : "opacity-40"}`}
        />
      </button>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <TableIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Chi tiết đơn hàng</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filtered.length} đơn hàng
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tim ten, SDT, dia chi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="px-0 pt-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[90px] pl-6">
                  <SortButton field="date">Ngày</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="customerName">Khách hàng</SortButton>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Thông tin
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="total">Tổng tiền</SortButton>
                </TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  Cọc
                </TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  Ship
                </TableHead>
                <TableHead className="text-right">
                  <SortButton field="remaining">COD</SortButton>
                </TableHead>
                <TableHead className="pr-6">
                  <SortButton field="status">Trạng thái</SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((order) => (
                <TableRow
                  key={order.id}
                  className="group transition-colors duration-150"
                >
                  <TableCell className="font-mono text-xs pl-6 text-muted-foreground">
                    {formatDate(order.date)}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[220px] truncate">
                    {order.addressPhoneNotes}
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm font-medium">
                    <CurrencyText value={order.total} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground hidden sm:table-cell">
                    <CurrencyText value={order.deposit} />
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm text-muted-foreground hidden sm:table-cell">
                    <CurrencyText value={order.shipping} />
                  </TableCell>
                  <TableCell className="text-center font-mono text-sm">
                    <CurrencyText
                      value={order.remaining}
                      className={
                        order.remaining > 0
                          ? "text-amber-600 dark:text-amber-400 font-medium"
                          : "text-muted-foreground"
                      }
                    />
                  </TableCell>
                  <TableCell className="pr-6">
                    {order.status === "xong" ||
                    order.status === "done" ||
                    order.status === "đã lên đơn" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10 text-[11px] font-medium">
                        {order.status}
                      </Badge>
                    ) : order.status ? (
                      <Badge
                        variant="secondary"
                        className="text-[11px] font-medium"
                      >
                        {order.status}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">
                        ---
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-12 text-muted-foreground"
                  >
                    {search
                      ? "Khong tim thay don hang phu hop"
                      : "Chua co du lieu"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 pt-4 pb-2 border-t">
            <p className="text-xs text-muted-foreground">
              {page * PAGE_SIZE + 1}&ndash;
              {Math.min((page + 1) * PAGE_SIZE, sorted.length)} /{" "}
              {sorted.length}
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="h-8 w-8 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs font-medium text-muted-foreground tabular-nums min-w-[3rem] text-center">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="h-8 w-8 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
