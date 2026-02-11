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
import { formatCurrency, formatDate } from "@/lib/format";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";

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
        o.notes.toLowerCase().includes(query)
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

  function SortButton({ field, children }: { field: SortField; children: React.ReactNode }) {
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Chi tiết đơn hàng</CardTitle>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm tên, SĐT, địa chỉ..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">
                  <SortButton field="date">Ngày</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="customerName">Khách hàng</SortButton>
                </TableHead>
                <TableHead className="hidden md:table-cell">Thông tin</TableHead>
                <TableHead className="text-right">
                  <SortButton field="total">Tổng tiền</SortButton>
                </TableHead>
                <TableHead className="text-right hidden sm:table-cell">Cọc</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Ship</TableHead>
                <TableHead className="text-right">
                  <SortButton field="remaining">Còn thu</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton field="status">Trạng thái</SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">
                    {formatDate(order.date)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                    {order.addressPhoneNotes}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(order.total)}
                  </TableCell>
                  <TableCell className="text-right font-mono hidden sm:table-cell">
                    {formatCurrency(order.deposit)}
                  </TableCell>
                  <TableCell className="text-right font-mono hidden sm:table-cell">
                    {formatCurrency(order.shipping)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(order.remaining)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "xong" || order.status === "done"
                          ? "default"
                          : "secondary"
                      }
                      className={
                        order.status === "xong" || order.status === "done"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : ""
                      }
                    >
                      {order.status || "---"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {search ? "Không tìm thấy đơn hàng phù hợp" : "Chưa có dữ liệu"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Hiển thị {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, sorted.length)} / {sorted.length} đơn
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
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
