import React from 'react'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency, formatDate, calculateStats, getCategoryById } from '../../utils/helpers.js'
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import ProgressBar from '../shared/ProgressBar.jsx'

export default function Dashboard() {
  const { transactions, categories, budgets, setPage } = useApp()

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const thisMonthTxns = transactions.filter(t =>
    isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
  )

  const allStats = calculateStats(transactions)
  const monthStats = calculateStats(thisMonthTxns)

  const recent = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  // Top spending categories this month
  const categorySpend = {}
  thisMonthTxns.filter(t => t.type === 'expense').forEach(t => {
    categorySpend[t.categoryId] = (categorySpend[t.categoryId] || 0) + Number(t.amount)
  })
  const topCategories = Object.entries(categorySpend)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, amount]) => ({ ...getCategoryById(categories, id), amount }))

  const maxCategorySpend = topCategories[0]?.amount || 1

  // Budget used
  const budgetUsed = monthStats.expense
  const budgetTotal = budgets.overall
  const budgetPct = budgetTotal > 0 ? Math.min((budgetUsed / budgetTotal) * 100, 100) : 0

  // Quick stats
  const expenseTxns = thisMonthTxns.filter(t => t.type === 'expense')
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const avgDailySpend = monthStats.expense / now.getDate()
  const biggestExpense = expenseTxns.reduce((max, t) => Number(t.amount) > Number(max) ? Number(t.amount) : max, 0)

  const statCards = [
    {
      title: 'Net Balance',
      value: formatCurrency(allStats.balance),
      subtitle: 'All time',
      icon: Wallet,
      gradient: 'from-indigo-600 to-purple-600',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
    {
      title: 'This Month Income',
      value: formatCurrency(monthStats.income),
      subtitle: `${thisMonthTxns.filter(t => t.type === 'income').length} transactions`,
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-green-600',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
    {
      title: 'This Month Expense',
      value: formatCurrency(monthStats.expense),
      subtitle: `${thisMonthTxns.filter(t => t.type === 'expense').length} transactions`,
      icon: TrendingDown,
      gradient: 'from-rose-500 to-red-600',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
    {
      title: 'Savings Rate',
      value: `${monthStats.savingsRate}%`,
      subtitle: formatCurrency(monthStats.income - monthStats.expense) + ' saved',
      icon: PiggyBank,
      gradient: 'from-blue-500 to-cyan-600',
      iconBg: 'bg-white/20',
      textColor: 'text-white',
    },
  ]

  return (
    <div className="p-4 sm:p-6 space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Namaste! <span className="gradient-text">नमस्ते 🙏</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's your financial overview for today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className={`stat-card bg-gradient-to-br ${card.gradient} rounded-2xl p-4 shadow-lg`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              <p className="text-white/80 text-xs font-medium mb-1">{card.title}</p>
              <p className="text-white font-bold text-lg sm:text-xl leading-none">{card.value}</p>
              <p className="text-white/60 text-xs mt-1">{card.subtitle}</p>
            </div>
          )
        })}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Budget Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Budget Overview</h3>
            <button onClick={() => setPage('budget')} className="text-orange-500 text-xs font-semibold hover:text-orange-600 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </button>
          </div>

          {/* Circular Progress */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={budgetPct >= 100 ? '#EF4444' : budgetPct >= 75 ? '#F59E0B' : '#10B981'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${budgetPct * 2.51} 251`}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{Math.round(budgetPct)}%</span>
                <span className="text-xs text-gray-400">used</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-gray-500">Spent this month</p>
                <p className="font-bold text-gray-900">{formatCurrency(budgetUsed)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total budget</p>
                <p className="font-bold text-gray-900">{formatCurrency(budgetTotal)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Remaining</p>
                <p className={`font-bold ${budgetTotal - budgetUsed < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {formatCurrency(Math.abs(budgetTotal - budgetUsed))}
                  {budgetTotal - budgetUsed < 0 ? ' over' : ' left'}
                </p>
              </div>
            </div>
          </div>

          {/* Category budgets mini */}
          <div className="mt-4 space-y-2">
            {Object.entries(budgets.categories).slice(0, 3).map(([catId, budget]) => {
              const cat = getCategoryById(categories, catId)
              const spent = thisMonthTxns.filter(t => t.categoryId === catId && t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
              return (
                <div key={catId} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">{cat.name}</span>
                      <span className="text-gray-400">{formatCurrency(spent)} / {formatCurrency(budget)}</span>
                    </div>
                    <ProgressBar value={spent} max={budget} showPercent={false} height="h-1.5" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Recent Transactions</h3>
            <button onClick={() => setPage('transactions')} className="text-orange-500 text-xs font-semibold hover:text-orange-600 flex items-center gap-1">
              View All <ArrowRight size={12} />
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">💸</p>
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map(txn => {
                const cat = getCategoryById(categories, txn.categoryId)
                return (
                  <div key={txn.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: cat.color + '20' }}
                    >
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{txn.note || cat.name}</p>
                      <p className="text-gray-400 text-xs">{cat.name} · {formatDate(txn.date, 'd MMM')}</p>
                    </div>
                    <span className={`font-bold text-sm ${txn.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Spending Categories */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Top Spending Categories</h3>
          {topCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm">No expenses this month</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: cat.color + '20' }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${(cat.amount / maxCategorySpend) * 100}%`, background: cat.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-xs text-orange-600 font-medium mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-orange-700">{thisMonthTxns.length}</p>
              <p className="text-xs text-orange-400">this month</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3">
              <p className="text-xs text-blue-600 font-medium mb-1">Avg Daily Spend</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(Math.round(avgDailySpend))}</p>
              <p className="text-xs text-blue-400">per day</p>
            </div>
            <div className="bg-rose-50 rounded-xl p-3">
              <p className="text-xs text-rose-600 font-medium mb-1">Biggest Expense</p>
              <p className="text-2xl font-bold text-rose-700">{formatCurrency(biggestExpense)}</p>
              <p className="text-xs text-rose-400">single transaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
