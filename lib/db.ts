// Database utilities using Deno KV
import type { Expense, User, CategoryTotals, DateRangeTotals } from "../types.ts";

// Initialize KV store
let kv: Deno.Kv | null = null;

export async function getKV(): Promise<Deno.Kv> {
  if (!kv) {
    kv = await Deno.openKv();
  }
  return kv;
}

// User operations
const USERS_PREFIX = ["users"];

export async function createUser(user: User): Promise<void> {
  const db = await getKV();
  const key = [...USERS_PREFIX, user.email];

  // Check if user already exists
  const existing = await db.get<User>(key);
  if (existing.value) {
    throw new Error("User already exists");
  }

  await db.set(key, user);
  await db.set([...USERS_PREFIX, "by_id", user.id], user);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getKV();
  const result = await db.get<User>([...USERS_PREFIX, email]);
  return result.value;
}

export async function getUserById(id: string): Promise<User | null> {
  const db = await getKV();
  const result = await db.get<User>([...USERS_PREFIX, "by_id", id]);
  return result.value;
}

// Expense operations
const EXPENSES_PREFIX = ["expenses"];

export async function createExpense(expense: Expense): Promise<void> {
  const db = await getKV();
  const key = [...EXPENSES_PREFIX, expense.userId, expense.id];

  await db.set(key, expense);

  // Add to user's expense list for quick retrieval
  await db.set([...EXPENSES_PREFIX, "by_user", expense.userId, expense.id], expense);
}

export async function getExpensesByUser(userId: string): Promise<Expense[]> {
  const db = await getKV();
  const expenses: Expense[] = [];

  const iterator = db.list<Expense>({ prefix: [...EXPENSES_PREFIX, "by_user", userId] });

  for await (const entry of iterator) {
    expenses.push(entry.value);
  }

  return expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getExpensesByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Expense[]> {
  const expenses = await getExpensesByUser(userId);

  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
}

export async function deleteExpense(userId: string, expenseId: string): Promise<void> {
  const db = await getKV();

  await db.delete([...EXPENSES_PREFIX, userId, expenseId]);
  await db.delete([...EXPENSES_PREFIX, "by_user", userId, expenseId]);
}

export async function updateExpense(expense: Expense): Promise<void> {
  const db = await getKV();
  const key = [...EXPENSES_PREFIX, expense.userId, expense.id];

  await db.set(key, expense);
  await db.set([...EXPENSES_PREFIX, "by_user", expense.userId, expense.id], expense);
}

// Analytics
export async function getCategoryTotals(userId: string): Promise<CategoryTotals[]> {
  const expenses = await getExpensesByUser(userId);
  const categoryMap = new Map<string, number>();

  for (const expense of expenses) {
    const current = categoryMap.get(expense.category) || 0;
    categoryMap.set(expense.category, current + expense.amount);
  }

  return Array.from(categoryMap.entries()).map(([category, total]) => ({
    category,
    total,
    count: expenses.filter(e => e.category === category).length,
  })).sort((a, b) => b.total - a.total);
}

export async function getDateRangeTotals(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<DateRangeTotals[]> {
  const expenses = await getExpensesByDateRange(userId, startDate, endDate);
  const dateMap = new Map<string, number>();

  for (const expense of expenses) {
    const dateKey = new Date(expense.date).toISOString().split('T')[0];
    const current = dateMap.get(dateKey) || 0;
    dateMap.set(dateKey, current + expense.amount);
  }

  return Array.from(dateMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getTotalSpent(userId: string): Promise<number> {
  const expenses = await getExpensesByUser(userId);
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export async function getThisMonthSpent(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const expenses = await getExpensesByDateRange(userId, startOfMonth, now);
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

// Cleanup
export function closeKV(): void {
  if (kv) {
    kv.close();
    kv = null;
  }
}
