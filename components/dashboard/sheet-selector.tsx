"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Calendar } from "lucide-react";

interface SheetSelectorProps {
  sheets: string[];
  selected: string;
  onChange: (sheet: string) => void;
  orderCount: number;
  totalCount: number;
}

export function SheetSelector({ sheets, selected, onChange, orderCount, totalCount }: SheetSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={selected === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("all")}
        className={`gap-2 cursor-pointer transition-all duration-200 ${
          selected === "all"
            ? "shadow-md shadow-primary/25"
            : "hover:bg-accent"
        }`}
      >
        <Layers className="h-3.5 w-3.5" />
        <span className="font-medium">Lifetime</span>
        <Badge
          variant="secondary"
          className={`ml-0.5 text-[10px] font-semibold px-1.5 py-0 h-5 ${
            selected === "all"
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {totalCount}
        </Badge>
      </Button>
      {sheets.map((sheet) => {
        const isActive = selected === sheet;
        const year = sheet.match(/\d{4}/)?.[0] || sheet;
        return (
          <Button
            key={sheet}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(sheet)}
            className={`gap-2 cursor-pointer transition-all duration-200 ${
              isActive
                ? "shadow-md shadow-primary/25"
                : "hover:bg-accent"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">{year}</span>
            {isActive && (
              <Badge
                variant="secondary"
                className="ml-0.5 text-[10px] font-semibold px-1.5 py-0 h-5 bg-primary-foreground/20 text-primary-foreground"
              >
                {orderCount}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
