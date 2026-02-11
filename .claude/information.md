# Order Dashboard - Project Information

## Overview
A statistics dashboard for order data sourced from a public Google Sheet (converted from Excel). Displays daily/monthly/yearly stats with charts, filters, and auto-sync capabilities.

## Tech Stack
- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Charts:** Recharts
- **Data Source:** Public Google Sheet → CSV fetch + parse
- **Caching:** File-based JSON cache (simple, Vercel-compatible)
- **Deployment:** Vercel (free tier)
- **Auto-sync:** Vercel Cron Jobs (hourly) + manual "Sync Now" button

## Data Structure
```typescript
interface Order {
  id: string;
  date: string;           // Column B: date (e.g., "4/1")
  customerName: string;    // Column C: customer name
  addressPhoneNotes: string; // Column D: address / phone / notes
  orderCode: string;       // Column E: order code or empty
  total: number;           // Column F: total product value
  deposit: number;         // Column G: prepaid deposit
  shipping: number;        // Column H: shipping fee (usually 15)
  remaining: number;       // Column I: remaining = total - deposit - shipping
  status: string;          // Column J: status ("xong" = done)
}
```

## Key Features
1. **Stats Cards:** Total revenue, deposits, remaining, order count
2. **Revenue Chart:** Line/bar chart over time (daily/monthly)
3. **Order Table:** Searchable, filterable, sortable with pagination
4. **Top Customers:** Ranked by total spend
5. **Auto Sync:** Hourly via Vercel Cron + manual button
6. **Dark/Light Mode:** Theme toggle
7. **Responsive:** Mobile-first design

## Google Sheet Integration
- Excel file → published as public Google Sheet
- Fetch as CSV: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid=0`
- Parse CSV → Order[] → cache as JSON
- Environment variable: `GOOGLE_SHEET_ID`

## Folder Structure
```
app/
├── layout.tsx          # Root layout with theme provider
├── page.tsx            # Main dashboard page
├── globals.css         # Global styles + shadcn theme
├── api/
│   └── sync/
│       └── route.ts    # Sync API endpoint (GET for cron, POST for manual)
├── favicon.ico
components/
├── ui/                 # shadcn/ui components
├── dashboard/
│   ├── stats-cards.tsx
│   ├── revenue-chart.tsx
│   ├── order-table.tsx
│   ├── top-customers.tsx
│   └── sync-button.tsx
├── theme-provider.tsx
└── theme-toggle.tsx
lib/
├── types.ts            # TypeScript interfaces
├── data.ts             # Data fetching & parsing
├── utils.ts            # Utility functions (cn, formatCurrency, etc.)
└── store.ts            # Simple data store/cache helpers
```
