import { Handlers } from "fresh/server.ts";
import {
  createExpense,
  getExpensesByUser,
  deleteExpense,
  updateExpense,
  getCategoryTotals,
  getDateRangeTotals,
  getTotalSpent,
  getThisMonthSpent,
} from "../../lib/db.ts";
import { getSessionUser } from "../../lib/auth.ts";
import type { Expense } from "../../types.ts";

// Simple UUID generator
function generateId(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const handler: Handlers = {
  async GET(req) {
    const user = await getSessionUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    try {
      if (action === "analytics") {
        const [totalSpent, thisMonthSpent, categoryTotals, dailyTotals] =
          await Promise.all([
            getTotalSpent(user.id),
            getThisMonthSpent(user.id),
            getCategoryTotals(user.id),
            getDateRangeTotals(
              user.id,
              new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              new Date()
            ),
          ]);

        const expenses = await getExpensesByUser(user.id);
        const recentExpenses = expenses.slice(0, 10);

        return new Response(
          JSON.stringify({
            totalSpent,
            thisMonthSpent,
            categoryTotals,
            dailyTotals,
            recentExpenses,
          }),
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      const expenses = await getExpensesByUser(user.id);
      return new Response(JSON.stringify(expenses), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Failed to fetch expenses" }),
        { status: 400 }
      );
    }
  },

  async POST(req) {
    const user = await getSessionUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    try {
      const body = await req.json();
      const expense: Expense = {
        id: generateId(),
        userId: user.id,
        title: body.title,
        amount: parseFloat(body.amount),
        category: body.category,
        date: body.date || new Date().toISOString(),
        notes: body.notes,
        createdAt: new Date().toISOString(),
      };

      await createExpense(expense);

      return new Response(JSON.stringify(expense), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Failed to create expense" }),
        { status: 400 }
      );
    }
  },

  async DELETE(req) {
    const user = await getSessionUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const url = new URL(req.url);
    const expenseId = url.searchParams.get("id");

    if (!expenseId) {
      return new Response(JSON.stringify({ error: "Expense ID required" }), {
        status: 400,
      });
    }

    try {
      await deleteExpense(user.id, expenseId);
      return new Response(null, { status: 204 });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Failed to delete expense" }),
        { status: 400 }
      );
    }
  },

  async PUT(req) {
    const user = await getSessionUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    try {
      const body = await req.json();
      const expense: Expense = {
        id: body.id,
        userId: user.id,
        title: body.title,
        amount: parseFloat(body.amount),
        category: body.category,
        date: body.date,
        notes: body.notes,
        createdAt: body.createdAt,
        updatedAt: new Date().toISOString(),
      };

      await updateExpense(expense);

      return new Response(JSON.stringify(expense), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Failed to update expense" }),
        { status: 400 }
      );
    }
  },
};
