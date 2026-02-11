export interface Order {
  id: string;
  date: string;
  customerName: string;
  addressPhoneNotes: string;
  total: number;
  deposit: number;
  shipping: number;
  remaining: number;
  status: string;
  notes: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalDeposit: number;
  totalRemaining: number;
  totalOrders: number;
  totalShipping: number;
  completedOrders: number;
}

export interface CustomerStat {
  name: string;
  totalSpent: number;
  orderCount: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface SyncResult {
  success: boolean;
  orderCount: number;
  lastSync: string;
  error?: string;
}
