// Type definitions

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: Category;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type Category =
  | "Food"
  | "Transportation"
  | "Shopping"
  | "Entertainment"
  | "Bills"
  | "Healthcare"
  | "Education"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills",
  "Healthcare",
  "Education",
  "Other",
];

export interface CategoryTotals {
  category: Category;
  total: number;
  count: number;
}

export interface DateRangeTotals {
  date: string;
  total: number;
}

export interface ExpenseAnalytics {
  totalSpent: number;
  thisMonthSpent: number;
  categoryTotals: CategoryTotals[];
  recentExpenses: Expense[];
  dailyTotals: DateRangeTotals[];
}
