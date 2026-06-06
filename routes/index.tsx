import { Head } from "fresh/runtime.ts";
import { defineRoute } from "$fresh/server.ts";
import { getSessionUser } from "../lib/auth.ts";
import ExpenseChart from "../islands/ExpenseChart.tsx";
import ExpenseForm from "../islands/ExpenseForm.tsx";
import ExpenseList from "../islands/ExpenseList.tsx";

export const handler = {
  async GET(req, ctx) {
    const user = await getSessionUser(req);

    if (!user) {
      return new Response(null, {
        status: 302,
        headers: { Location: "/login" },
      });
    }

    return ctx.render({ user });
  },
};

export default defineRoute((_req, _ctx) => {
  return (
    <>
      <Head>
        <title>Expense Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div class="min-h-screen bg-gray-50">
        <header class="bg-white shadow-sm sticky top-0 z-10">
          <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <h1 class="text-xl font-bold text-gray-900">Expense Tracker</h1>
              <p class="text-sm text-gray-500">Track your daily spending</p>
            </div>

            <a
              href="/logout"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Sign Out
            </a>
          </div>
        </header>

        <main class="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* Analytics Section */}
          <section>
            <ExpenseChart />
          </section>

          {/* Add Expense Form */}
          <section>
            <ExpenseForm />
          </section>

          {/* Expense List */}
          <section>
            <ExpenseList />
          </section>
        </main>

        <footer class="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Built with Deno + Fresh</p>
        </footer>
      </div>
    </>
  );
});
