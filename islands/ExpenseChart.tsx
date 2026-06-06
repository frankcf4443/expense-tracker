import { useState, useEffect } from "preact/hooks";

interface CategoryTotals {
  category: string;
  total: number;
  count: number;
}

interface ExpenseAnalytics {
  totalSpent: number;
  thisMonthSpent: number;
  categoryTotals: CategoryTotals[];
}

export default function ExpenseChart() {
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/expenses?action=analytics");
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      } else {
        setError("Failed to load analytics");
      }
    } catch (err) {
      setError("Network error");
      console.error("Analytics load error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();

    // Listen for custom event from ExpenseForm
    const handleExpenseAdded = () => {
      console.log("Expense added event received, reloading analytics...");
      loadAnalytics();
    };

    globalThis.addEventListener("expense-added", handleExpenseAdded);

    return () => {
      globalThis.removeEventListener("expense-added", handleExpenseAdded);
    };
  }, []);

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const COLORS = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
    "#8B5CF6", "#EC4899", "#06B6D4", "#6B7280",
  ];

  if (isLoading) {
    return (
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Analytics</h2>
        <div class="animate-pulse space-y-4">
          <div class="h-20 bg-gray-200 rounded"></div>
          <div class="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Analytics</h2>
        <p class="text-red-600">{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Analytics</h2>
        <p class="text-gray-500">No data available</p>
      </div>
    );
  }

  const { totalSpent, thisMonthSpent, categoryTotals } = analytics;

  return (
    <div class="space-y-6">
      <div class="grid grid-2 gap-4">
        <div class="bg-white rounded-lg shadow-md p-6">
          <p class="text-sm font-medium text-gray-600 mb-1">Total Spent</p>
          <p class="text-2xl font-bold text-gray-900">
            {formatCurrency(totalSpent)}
          </p>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <p class="text-sm font-medium text-gray-600 mb-1">This Month</p>
          <p class="text-2xl font-bold text-blue-600">
            {formatCurrency(thisMonthSpent)}
          </p>
        </div>
      </div>

      {categoryTotals.length > 0 && (
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">
            Spending by Category
          </h2>
          <div class="space-y-4">
            {categoryTotals.slice(0, 5).map((cat, index) => {
              const percentage = totalSpent > 0 ? (cat.total / totalSpent) * 100 : 0;
              const color = COLORS[index % COLORS.length];

              return (
                <div key={cat.category}>
                  <div class="flex justify-between items-center mb-1">
                    <span class="font-medium text-gray-700">{cat.category}</span>
                    <span class="text-sm text-gray-500">
                      {formatCurrency(cat.total)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-3">
                    <div
                      class="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
        <h3 class="font-semibold mb-2">Quick Insight</h3>
        {categoryTotals.length > 0 ? (
          <p>
            Your highest spending category is{" "}
            <span class="font-bold">{categoryTotals[0].category}</span> with{" "}
            {formatCurrency(categoryTotals[0].total)} (
            {totalSpent > 0
              ? ((categoryTotals[0].total / totalSpent) * 100).toFixed(1)
              : 0}% of total)
          </p>
        ) : (
          <p>Start adding expenses to see insights here!</p>
        )}
      </div>
    </div>
  );
}
