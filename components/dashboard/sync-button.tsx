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
    if (!dateStr) return "Chua dong bo";
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
    <div className="flex items-center gap-2.5">
      <div className="hidden sm:flex items-center gap-1.5">
        <div className={`h-1.5 w-1.5 rounded-full ${status === "success" ? "bg-emerald-500" : status === "error" ? "bg-red-500" : "bg-muted-foreground/40"}`} />
        <span className="text-[11px] text-muted-foreground">
          {formatLastSync(lastSync)}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={syncing}
        className="gap-2 h-8 text-xs cursor-pointer transition-all duration-200 hover:shadow-sm"
      >
        {status === "success" ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        ) : status === "error" ? (
          <AlertCircle className="h-3.5 w-3.5 text-destructive" />
        ) : (
          <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
        )}
        {syncing ? "Syncing..." : status === "success" ? "Done!" : status === "error" ? "Error" : "Sync"}
      </Button>
    </div>
  );
}
