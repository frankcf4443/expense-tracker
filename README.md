# Expense Tracker

A mobile-friendly daily expense tracking web application built with [Deno](https://deno.com/) and [Fresh](https://fresh.deno.dev/).

## Features

- **User Authentication** - Sign up and log in securely
- **Expense Tracking** - Add, view, and delete expenses
- **Categories** - Organize expenses by category (Food, Transportation, Shopping, etc.)
- **Analytics** - View spending breakdown by category
- **Mobile-Friendly** - Responsive design optimized for smartphones
- **Deno KV** - Built-in key-value database for data storage

## Tech Stack

- **Runtime**: Deno 2.8+
- **Framework**: Fresh (Preact-based web framework)
- **Database**: Deno KV (key-value store)
- **Styling**: Tailwind CSS (via Twind)

## Getting Started

### Prerequisites

- Deno 2.8 or later installed

### Installation

```bash
cd expense-tracker
```

### Development

```bash
deno task dev
```

The application will be available at `http://localhost:8000`

### Production

```bash
deno task start
```

## Usage

1. **Register**: Create an account with your email, name, and password
2. **Add Expenses**: Click the form to add your daily expenses
3. **View Analytics**: See your spending breakdown by category
4. **Manage**: View and delete your expense history

## Deploy to Deno Deploy

This application is ready to deploy to [Deno Deploy](https://dash.deno.com/):

1. Create a new project on Deno Deploy
2. Connect your GitHub repository
3. Set the entry point to `main.ts`
4. Enable KV database
5. Deploy!

## Project Structure

```
expense-tracker/
├── islands/          # Interactive components (Preact)
│   ├── ExpenseForm.tsx
│   ├── ExpenseList.tsx
│   └── ExpenseChart.tsx
├── lib/              # Utility libraries
│   ├── auth.ts       # Authentication logic
│   └── db.ts         # Database operations
├── routes/           # Page routes and API handlers
│   ├── _app.tsx      # App layout
│   ├── index.tsx     # Home page
│   ├── login.tsx     # Login page
│   ├── register.tsx  # Registration page
│   ├── logout.ts     # Logout handler
│   └── api/          # API endpoints
│       ├── auth.ts
│       └── expenses.ts
├── types.ts          # TypeScript type definitions
├── main.ts           # Application entry point
└── deno.json         # Project configuration
```

## License

MIT
