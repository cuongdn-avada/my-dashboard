import Papa from "papaparse";
import { promises as fs } from "fs";
import path from "path";
import type { Order, DashboardStats, CustomerStat, DailyRevenue } from "./types";

const CACHE_FILE = path.join(process.cwd(), "data", "orders.json");
const META_FILE = path.join(process.cwd(), "data", "meta.json");

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
    // Validate: day 1-31, month 1-12
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

export async function fetchFromGoogleSheet(): Promise<Order[]> {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    throw new Error("GOOGLE_SHEET_ID environment variable is not set");
  }

  const gid = process.env.GOOGLE_SHEET_GID || "0";
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();
  return parseCSV(csvText);
}

export function parseCSV(csvText: string): Order[] {
  const result = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = result.data as string[][];
  const orders: Order[] = [];

  // Skip header row(s) - find first row with actual data
  // CSV columns: 0=STT, 1=Thời gian, 2=Tên KH, 3=Địa chỉ, 4=Trị giá SP, 5=Cọc, 6=Phí VC, 7=Còn thu, 8=Tình trạng, 9=Lưu ý, 10=Tổng DT ngày
  let startIndex = 0;
  for (let i = 0; i < Math.min(5, rows.length); i++) {
    const row = rows[i];
    // Check if this row looks like a header (contains non-numeric text in the total column)
    if (row[4] && isNaN(parseFloat(row[4].toString().replace(/[^\d.-]/g, "")))) {
      startIndex = i + 1;
    }
  }

  // Track the last seen date to carry forward (dates only appear on first row of each day)
  let lastDate = "";

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 5) continue;

    const customerName = (row[2] || "").trim();
    const total = parseNumber(row[4]);

    // Skip rows without customer name (these are summary/total rows in the sheet)
    if (!customerName) continue;

    // Carry forward date from previous rows
    const rawDate = parseDate(row[1]);
    if (rawDate) lastDate = rawDate;

    const order: Order = {
      id: `order-${i}`,
      date: lastDate,
      customerName,
      addressPhoneNotes: (row[3] || "").trim(),
      total,
      deposit: parseNumber(row[5]),
      shipping: parseNumber(row[6]),
      remaining: parseNumber(row[7]),
      status: (row[8] || "").trim().toLowerCase(),
      notes: (row[9] || "").trim(),
    };

    orders.push(order);
  }

  return orders;
}

export async function saveOrders(orders: Order[]): Promise<void> {
  const dir = path.dirname(CACHE_FILE);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(orders, null, 2));
  await fs.writeFile(META_FILE, JSON.stringify({ lastSync: new Date().toISOString(), orderCount: orders.length }));
}

export async function loadOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(CACHE_FILE, "utf-8");
    return JSON.parse(data) as Order[];
  } catch {
    return [];
  }
}

export async function getLastSync(): Promise<{ lastSync: string; orderCount: number } | null> {
  try {
    const data = await fs.readFile(META_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Stats computation functions

export function computeStats(orders: Order[]): DashboardStats {
  return {
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    totalDeposit: orders.reduce((sum, o) => sum + o.deposit, 0),
    totalRemaining: orders.reduce((sum, o) => sum + o.remaining, 0),
    totalOrders: orders.length,
    totalShipping: orders.reduce((sum, o) => sum + o.shipping, 0),
    completedOrders: orders.filter((o) => o.status === "xong" || o.status === "done").length,
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
      map.set(order.customerName, {
        name: order.customerName,
        totalSpent: order.total,
        orderCount: 1,
      });
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit);
}

export function computeDailyRevenue(orders: Order[]): DailyRevenue[] {
  const map = new Map<string, DailyRevenue>();

  for (const order of orders) {
    if (!order.date) continue;
    const existing = map.get(order.date);
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    } else {
      map.set(order.date, {
        date: order.date,
        revenue: order.total,
        orders: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function computeMonthlyRevenue(orders: Order[]): DailyRevenue[] {
  const map = new Map<string, DailyRevenue>();

  for (const order of orders) {
    if (!order.date) continue;
    const month = order.date.substring(0, 7); // "YYYY-MM"
    const existing = map.get(month);
    if (existing) {
      existing.revenue += order.total;
      existing.orders += 1;
    } else {
      map.set(month, {
        date: month,
        revenue: order.total,
        orders: 1,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}
