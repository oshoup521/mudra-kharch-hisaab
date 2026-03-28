# 🪷 Mudra — मुद्रा खर्च हिसाब

> **Mudra** is a smart, India-focused personal expense tracker that helps you manage your money, track budgets, and stay on top of your finances — all synced to the cloud in real time.

---

## ✨ Features

- **Dashboard** — At-a-glance stats, budget overview, recent transactions, and top spending categories
- **Transactions** — Full CRUD with advanced filtering (search, date range, type, category, tag)
- **Budget** — Set overall and per-category budgets with progress bars and health indicators
- **Categories & Tags** — Customise with emoji and color pickers; tags support cascade delete
- **Ledger / Udhaari Tracker** — Track money lent or borrowed with partial settlement support
- **Scheduled Transactions** — Manage recurring bills and income; auto-advance after marking done
- **Analysis** — Bar, pie, area, and budget-vs-actual charts plus a top-expenses breakdown
- **Settings** — Profile, currency preference, sync status, and data-clear options
- **Responsive Design** — Mobile bottom nav and desktop sidebar
- **Indian Formatting** — ₹1,23,456 number formatting and Hindi/Hinglish labels
- **Offline Fallback** — LocalStorage persistence when the network is unavailable

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Charts | [Recharts](https://recharts.org/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Backend / Auth | [Supabase](https://supabase.com/) (PostgreSQL + Auth) |
| Date utils | [date-fns](https://date-fns.org/) |

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Supabase](https://supabase.com/) project (free tier works fine)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/oshoup521/mudra-kharch-hisaab.git
cd mudra-kharch-hisaab

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Fill in your Supabase URL and anon key in .env

# 4. Start the development server
npm run dev
```

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase project anon/public key |

### Build for Production

```bash
npm run build   # outputs to dist/
npm run preview # preview the production build locally
```

## 📅 Roadmap

See [FUTURE_SCOPE.md](./FUTURE_SCOPE.md) for planned features including dark mode, PWA support, CSV export, multi-currency conversion, and more.

## 📄 License

This project is private. All rights reserved.
