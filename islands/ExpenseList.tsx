import { useState, useEffect } from "preact/hooks";
import type { Expense } from "@/types.ts";

interface ExpenseListProps {
  refreshTrigger?: number;
}

export default function ExpenseList(props: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function loadExpenses() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/expenses");
      if (res.ok) {
        setExpenses(await res.json());
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();

    // Listen for custom event from ExpenseForm
    const handleExpenseAdded = () => {
      console.log("Expense added event received, reloading...");
      loadExpenses();
    };

    globalThis.addEventListener("expense-added", handleExpenseAdded);

    return () => {
      globalThis.removeEventListener("expense-added", handleExpenseAdded);
    };
  }, []);

  useEffect(() => {
    if (props.refreshTrigger) {
      loadExpenses();
    }
  }, [props.refreshTrigger]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    setDeleteId(id);

    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setExpenses(expenses.filter((e) => e.id !== id));
      }
    } finally {
      setDeleteId(null);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      Food: "bg-orange-100 text-orange-800",
      Transportation: "bg-blue-100 text-blue-800",
      Shopping: "bg-pink-100 text-pink-800",
      Entertainment: "bg-purple-100 text-purple-800",
      Bills: "bg-red-100 text-red-800",
      Healthcare: "bg-green-100 text-green-800",
      Education: "bg-indigo-100 text-indigo-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors.Other;
  }

  if (isLoading) {
    return (
      <div class="bg-white rounded-lg shadow-md p-6 text-center">
        <div class="animate-pulse space-y-4">
          <div class="h-6 bg-gray-200 rounded w-1/4 mx-auto"></div>
          <div class="space-y-3">
            <div class="h-12 bg-gray-200 rounded"></div>
            <div class="h-12 bg-gray-200 rounded"></div>
            <div class="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div class="bg-white rounded-lg shadow-md p-12 text-center">
        <div class="text-gray-400 mb-4">
          <svg
            class="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">No expenses yet</h3>
        <p class="text-gray-500">
          Add your first expense to start tracking your spending
        </p>
      </div>
    );
  }

  return (
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-bold text-gray-800">Recent Expenses</h2>
      </div>

      <ul class="divide-y divide-gray-200">
        {expenses.map((expense) => (
          <li
            key={expense.id}
            class="px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <h3 class="font-semibold text-gray-800 truncate">
                    {expense.title}
                  </h3>
                  <span
                    class={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                      expense.category
                    )}`}
                  >
                    {expense.category}
                  </span>
                </div>
                <div class="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>{formatDate(expense.date)}</span>
                  {expense.notes && <span class="truncate">{expense.notes}</span>}
                </div>
              </div>

              <div class="flex items-center gap-4 ml-4">
                <span class="text-lg font-bold text-gray-900">
                  {formatCurrency(expense.amount)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(expense.id)}
                  disabled={deleteId === expense.id}
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  aria-label="Delete expense"
                >
                  {deleteId === expense.id ? (
                    <svg
                      class="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
