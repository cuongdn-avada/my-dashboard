import Papa from "papaparse";
import type { Order, DashboardStats, CustomerStat, DailyRevenue } from "./types";

function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.toString().replace(/[^\d.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseDate(value: string | undefined, year: number = new Date().getFullYear()): string {
  if (!value) return "";
  const trimmed = value.toString().trim();

  // Vietnamese date format: D/M or D/M/YYYY (day first, then month)
  const parts = trimmed.split("/");
  if (parts.length >= 2) {
    const dayNum = parseInt(parts[0], 10);
    const monthNum = parseInt(parts[1], 10);
    if (isNaN(dayNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
      return "";
    }
    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const y = parts[2] ? (parts[2].length === 2 ? `20${parts[2]}` : parts[2]) : year.toString();
    return `${y}-${month}-${day}`;
  }

  return "";
}

function getSheetId(): string {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error("GOOGLE_SHEET_ID environment variable is not set");
  return sheetId;
}

// Extract the year from sheet name like "Order 2025" → 2025
function yearFromSheetName(name: string): number {
  const match = name.match(/\d{4}/);
  return match ? parseInt(match[0], 10) : new Date().getFullYear();
}

// Discover which "Order YYYY" sheets actually exist
export async function discoverSheets(): Promise<string[]> {
  const spreadsheetId = getSheetId();
  const currentYear = new Date().getFullYear();
  const candidateYears = Array.from({ length: 10 }, (_, i) => currentYear - 7 + i);

  const defaultUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&tq=select%20*%20limit%201`;
  const defaultRes = await fetch(defaultUrl, { cache: "no-store" });
  const defaultText = await defaultRes.text();
  const defaultJson = JSON.parse(defaultText.replace(/^[^(]+\(/, "").replace(/\);?$/, ""));
  const defaultSig = defaultJson.sig;

  const results = await Promise.all(
    candidateYears.map(async (year) => {
      const name = `Order ${year}`;
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&tq=select%20*%20limit%201&sheet=${encodeURIComponent(name)}`;
      const res = await fetch(url, { cache: "no-store" });
      const text = await res.text();
      const json = JSON.parse(text.replace(/^[^(]+\(/, "").replace(/\);?$/, ""));
      return { name, sig: json.sig };
    })
  );

  const sigToSheets = new Map<string, string[]>();
  for (const r of results) {
    const list = sigToSheets.get(r.sig) || [];
    list.push(r.name);
    sigToSheets.set(r.sig, list);
  }

  const realSheets: string[] = [];
  for (const [sig, names] of sigToSheets) {
    if (sig === defaultSig) {
      const gid = process.env.GOOGLE_SHEET_GID || "0";
      const gidUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&tq=select%20*%20limit%201&gid=${gid}`;
      const gidRes = await fetch(gidUrl, { cache: "no-store" });
      const gidText = await gidRes.text();
      const gidJson = JSON.parse(gidText.replace(/^[^(]+\(/, "").replace(/\);?$/, ""));
      if (gidJson.sig === defaultSig) {
        const validNames = names
          .map((n) => ({ name: n, year: yearFromSheetName(n) }))
          .filter((n) => n.year <= currentYear)
          .sort((a, b) => b.year - a.year);
        if (validNames.length > 0) {
          realSheets.push(validNames[0].name);
        }
      }
    } else {
      realSheets.push(names[0]);
    }
  }

  return realSheets.sort();
}

async function fetchSheetCSV(sheetName: string): Promise<string> {
  const spreadsheetId = getSheetId();
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet "${sheetName}": ${response.status}`);
  }
  return response.text();
}

export function parseCSV(csvText: string, sheetName: string = ""): Order[] {
  const result = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = result.data as string[][];
  const orders: Order[] = [];
  const year = yearFromSheetName(sheetName);

  let startIndex = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i];
    if (row[4] && isNaN(parseFloat(row[4].toString().replace(/[^\d.-]/g, "")))) {
      startIndex = i + 1;
    }
  }

  let lastDate = "";

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 5) continue;

    const customerName = (row[2] || "").trim();
    if (!customerName) continue;

    const rawDate = parseDate(row[1], year);
    if (rawDate) lastDate = rawDate;

    const order: Order = {
      id: `${sheetName}-${i}`,
      date: lastDate,
      customerName,
      addressPhoneNotes: (row[3] || "").trim(),
      total: parseNumber(row[4]),
      deposit: parseNumber(row[5]),
      shipping: parseNumber(row[6]),
      remaining: parseNumber(row[7]),
      status: (row[8] || "").trim().toLowerCase(),
      notes: (row[9] || "").trim(),
      sheetName,
    };

    orders.push(order);
  }

  return orders;
}

// Fetch and parse all Order sheets (called directly from server components)
export async function fetchAllSheets(): Promise<{ orders: Order[]; sheets: string[] }> {
  const sheets = await discoverSheets();
  const allOrders: Order[] = [];

  const results = await Promise.all(
    sheets.map(async (name) => {
      const csv = await fetchSheetCSV(name);
      return parseCSV(csv, name);
    })
  );

  for (const orders of results) {
    allOrders.push(...orders);
  }

  return { orders: allOrders, sheets };
}

// Stats computation functions

export function computeStats(orders: Order[]): DashboardStats {
  return {
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    totalDeposit: orders.reduce((sum, o) => sum + o.deposit, 0),
    totalRemaining: orders.reduce((sum, o) => sum + o.remaining, 0),
    totalOrders: orders.length,
    totalShipping: orders.reduce((sum, o) => sum + o.shipping, 0),
    completedOrders: orders.filter((o) => o.status === "xong" || o.status === "done" || o.status === "đã lên đơn").length,
  };
}

export function computeTopCustomers(orders: Order[], limit: number = 10): CustomerStat[] {
  const map = new Map<string, CustomerStat>();
  for (const order of orders) {
    if (!order.customerName) continue;
    const existing = map.get(order.customerName);
    if (existing) {
      existing.totalSpent += order.total;
      existing.orderCount += 1;
    } else {
      map.set(order.customerName, { name: order.customerName, totalSpent: order.total, orderCount: 1 });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, limit);
}

export function computeDailyRevenue(orders: Order[]): DailyRevenue[] {
  const map = new Map<string, DailyRevenue>();
  for (const order of orders) {
    if (!order.date) continue;
    const existing = map.get(order.date);
    if (existing) { existing.revenue += order.total; existing.orders += 1; }
    else map.set(order.date, { date: order.date, revenue: order.total, orders: 1 });
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function computeMonthlyRevenue(orders: Order[]): DailyRevenue[] {
  const map = new Map<string, DailyRevenue>();
  for (const order of orders) {
    if (!order.date) continue;
    const month = order.date.substring(0, 7);
    const existing = map.get(month);
    if (existing) { existing.revenue += order.total; existing.orders += 1; }
    else map.set(month, { date: month, revenue: order.total, orders: 1 });
  }
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
