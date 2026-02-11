export interface CurrencyParts {
  display: string;
  fullVND: string;
}

export function formatCurrencyParts(value: number): CurrencyParts {
  const fullVND = new Intl.NumberFormat("vi-VN", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(value * 1000) + " VND";

  if (value >= 1000) {
    const tr = value / 1000;
    // Truncate to 2 decimal places (no rounding): 4865 -> 4,86tr
    const truncated = Math.floor(tr * 100) / 100;
    const display = truncated % 1 === 0
      ? `${truncated}tr`
      : `${truncated.toFixed(2).replace(/0+$/, "").replace(/\.$/, "").replace(".", ",")}tr`;
    return { display, fullVND };
  }

  return {
    display: new Intl.NumberFormat("vi-VN", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(value) + "k",
    fullVND,
  };
}

export function formatCurrency(value: number): string {
  return formatCurrencyParts(value).display;
}

export function formatCurrencyFull(value: number): string {
  return formatCurrencyParts(value).fullVND;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return dateStr;
  }
}
