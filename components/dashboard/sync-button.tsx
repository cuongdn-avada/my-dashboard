"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

interface SyncButtonProps {
  lastSync: string | null;
  onSyncComplete?: () => void;
}

export function SyncButton({ lastSync, onSyncComplete }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleSync() {
    setSyncing(true);
    setStatus("idle");

    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        onSyncComplete?.();
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 5000);
    } finally {
      setSyncing(false);
    }
  }

  function formatLastSync(dateStr: string | null) {
    if (!dateStr) return "Chưa đồng bộ";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground hidden sm:inline">
        Cập nhật: {formatLastSync(lastSync)}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={syncing}
        className="gap-2"
      >
        {status === "success" ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : status === "error" ? (
          <AlertCircle className="h-4 w-4 text-destructive" />
        ) : (
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
        )}
        {syncing ? "Đang đồng bộ..." : status === "success" ? "Thành công!" : status === "error" ? "Lỗi!" : "Sync Now"}
      </Button>
    </div>
  );
}
