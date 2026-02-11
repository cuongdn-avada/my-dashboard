"use client";

import { formatCurrencyParts } from "@/lib/format";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CurrencyTextProps {
  value: number;
  className?: string;
}

export function CurrencyText({ value, className }: CurrencyTextProps) {
  const { display, fullVND } = formatCurrencyParts(value);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className}>{display}</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{fullVND}</p>
      </TooltipContent>
    </Tooltip>
  );
}
