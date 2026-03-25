# Mudra मुद्रा — Future Scope & Roadmap

A living document tracking planned features and enhancements. Pick one, build it, check it off.

---

## 🔴 High Priority / Core Features

- [ ] **Export Data** — Export transactions to CSV / PDF / Excel. Commonly requested for personal finance apps.
- [ ] **Dark Mode** — `theme` field already exists in settings data model but is unused. Implement full dark mode via Tailwind's `dark:` classes.
- [ ] **Sign Up / Registration** — Currently only login exists. Add a registration form using Supabase `signUp()`.
- [ ] **PWA (Progressive Web App)** — Add `manifest.json` + service worker (via `vite-plugin-pwa`) so users can install it on their phone like a native app.

---

## 🟠 Analytics & Insights

- [ ] **Monthly Report Card** — AI-style text insights: "This month you spent ₹X more than last month on Food."
- [ ] **Year-in-Review / Annual Summary** — Full year breakdown with a spending heatmap (GitHub contribution graph style).
- [ ] **Savings Goals** — Create a goal (e.g., "Save ₹50,000 for trip") and track progress from income surplus.
- [ ] **Category Spending Trends** — Show if a category's spend is trending up/down over rolling months.

---

## 🟡 UX / Polish

- [ ] **Onboarding Flow** — First-time user walkthrough showing how to add a transaction, set a budget, etc.
- [ ] **Global Search** — A single search bar that finds transactions, ledger entries, and scheduled items simultaneously.
- [ ] **Transaction Attachments** — Attach a photo of a bill/receipt (store in Supabase Storage).
- [ ] **Bulk Actions** — Select multiple transactions to delete, re-tag, or re-categorize at once.
- [ ] **Split Expense** — Split a single transaction among multiple people (integrates with Ledger module).

---

## 🟢 Technical / Infrastructure

- [ ] **Offline Support** — Queue changes locally when offline (IndexedDB / localStorage queue), sync when back online.
- [ ] **Multi-Currency with Live Rates** — Currency setting exists (₹/$/ €/£) but no conversion. Add live exchange rate fetching.
- [ ] **Multiple Accounts** — Cash, bank account, credit card — track balance per account and filter transactions by account.
- [ ] **Google / OTP Login** — Add Google OAuth or phone OTP (both supported by Supabase). OTP is especially relevant for Indian users.
- [ ] **Data Backup & Restore** — Download a full JSON backup of all data and restore from it.
- [ ] **Import Transactions** — CSV import to bulk-add past transactions (e.g., from a bank statement).

---

## 🔵 Notifications & Automation

- [ ] **Scheduled Transaction Reminders** — Browser push notifications (Web Push API) for bills/EMIs due today.
- [ ] **Budget Overspend Alert** — In-app toast / notification when a category budget is about to be exceeded.

---

## 🟣 India-Focused / Finance-Specific

- [ ] **EMI Calculator** — Calculate monthly EMI for a loan and auto-create recurring scheduled transactions for it.
- [ ] **Tax Estimator** — Basic 80C investment tracking + income tax slab estimate based on income transactions.
- [ ] **SIP / Investment Tracker** — Dedicated view for tracking mutual fund SIPs (can leverage Scheduled module as base).
- [ ] **UPI Quick-Add** — Quick-add shortcut optimized for UPI payment descriptions (e.g., parse "Paid ₹200 to Swiggy via UPI").

---

## ✅ Already Built

- [x] Email + Password Authentication (Supabase)
- [x] Cloud Auto-Sync (Supabase PostgreSQL, every 1.5s)
- [x] Dashboard with stats, budget overview, recent transactions, top categories
- [x] Transactions — full CRUD, advanced filtering (search, date, type, category, tag)
- [x] Add Transaction Modal with category grid, tags, date picker
- [x] Budget — overall + per-category with progress bars and health indicators
- [x] Categories — full CRUD with emoji picker and color picker
- [x] Tags — full CRUD with color picker, usage count, cascade delete
- [x] Ledger / Udhaari Tracker — lent/borrowed tracking with partial settlements
- [x] Scheduled Transactions — recurring bills/income with mark-done auto-advance
- [x] Analysis — 4 charts (bar, pie, area, budget vs actual) + top expenses
- [x] Settings — profile, currency, sync status, clear data
- [x] Responsive Design — mobile bottom nav + desktop sidebar
- [x] Indian number formatting (₹1,23,456) + Hindi/Hinglish labels
- [x] LocalStorage persistence as offline fallback
