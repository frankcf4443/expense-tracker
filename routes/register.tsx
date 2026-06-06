import { Head } from "fresh/runtime.ts";
import { defineRoute } from "$fresh/server.ts";

export default defineRoute((_req, _ctx) => {
  return (
    <>
      <Head>
        <title>Register - Expense Tracker</title>
      </Head>
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p class="text-gray-600">Start tracking your expenses today</p>
          </div>

          <form id="registerForm" class="space-y-6">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Your name"
              />
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minlength="8"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="At least 8 characters"
              />
              <p class="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
            </div>

            <button
              type="submit"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              Create Account
            </button>
          </form>

          <p class="mt-6 text-center text-gray-600">
            Already have an account?{" "}
            <a href="/login" class="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </a>
          </p>

          <p id="error" class="hidden mt-4 text-center text-red-600 bg-red-50 py-2 rounded"></p>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
          document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const error = document.getElementById('error');
            const name = form.name.value;
            const email = form.email.value;
            const password = form.password.value;

            try {
              const res = await fetch('/api/auth?action=register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
              });

              const data = await res.json();

              if (res.ok) {
                window.location.href = '/';
              } else {
                error.textContent = data.error;
                error.classList.remove('hidden');
              }
            } catch (err) {
              error.textContent = 'Network error. Please try again.';
              error.classList.remove('hidden');
            }
          });
        `}} />
      </div>
    </>
  );
});
