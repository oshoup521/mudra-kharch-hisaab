import React, { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency, calculateStats, getCategoryById, getDateRange } from '../../utils/helpers.js'
import { format, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval, subMonths } from 'date-fns'

const PERIODS = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-lg text-sm">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {formatCurrency(p.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Analysis() {
  const { transactions, categories, budgets } = useApp()
  const [period, setPeriod] = useState('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const { start, end } = useMemo(() => {
    if (period === 'custom' && customStart && customEnd) {
      return { start: new Date(customStart), end: new Date(customEnd) }
    }
    if (period === 'custom') return getDateRange('month')
    return getDateRange(period)
  }, [period, customStart, customEnd])

  const filtered = useMemo(() => {
    return transactions.filter(t => isWithinInterval(new Date(t.date), { start, end }))
  }, [transactions, start, end])

  const stats = calculateStats(filtered)

  // Chart 1: Income vs Expense - last 6 months
  const last6Months = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i)
      const mStart = startOfMonth(d)
      const mEnd = endOfMonth(d)
      const monthTxns = transactions.filter(t =>
        isWithinInterval(new Date(t.date), { start: mStart, end: mEnd })
      )
      const inc = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
      const exp = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
      return { month: format(d, 'MMM'), income: inc, expense: exp }
    })
  }, [transactions])

  // Chart 2: Spending by category (pie)
  const categoryData = useMemo(() => {
    const spend = {}
    filtered.filter(t => t.type === 'expense').forEach(t => {
      spend[t.categoryId] = (spend[t.categoryId] || 0) + Number(t.amount)
    })
    return Object.entries(spend)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([id, amount]) => {
        const cat = getCategoryById(categories, id)
        return { id, name: cat.name, icon: cat.icon, amount, color: cat.color }
      })
  }, [filtered, categories])

  // Chart 3: Daily spending trend
  const dailyTrend = useMemo(() => {
    const days = eachDayOfInterval({ start, end })
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayTxns = filtered.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === dayStr)
      const expense = dayTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
      const income = dayTxns.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
      return { date: format(day, 'd MMM'), expense, income }
    })
  }, [filtered, start, end])

  // Chart 4: Budget vs Actual
  const budgetVsActual = useMemo(() => {
    return Object.entries(budgets.categories)
      .filter(([, budget]) => budget > 0)
      .map(([catId, budget]) => {
        const cat = getCategoryById(categories, catId)
        const actual = transactions
          .filter(t => t.categoryId === catId && t.type === 'expense' &&
            isWithinInterval(new Date(t.date), { start: startOfMonth(new Date()), end: endOfMonth(new Date()) }))
          .reduce((s, t) => s + Number(t.amount), 0)
        return { name: `${cat.icon} ${cat.name}`, budget, actual }
      })
  }, [budgets, categories, transactions])

  // Top 5 transactions
  const top5 = [...filtered]
    .filter(t => t.type === 'expense')
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5)

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      {/* Header + Period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">Analysis</h2>
          <p className="text-gray-500 text-sm">Financial insights and trends</p>
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 shadow-sm flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p.value ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
              style={period === p.value ? { background: 'linear-gradient(135deg, #F97316, #EA580C)' } : {}}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      {period === 'custom' && (
        <div className="flex gap-2 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
          <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          <span className="self-center text-gray-400 text-sm">to</span>
          <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Income', value: formatCurrency(stats.income), color: 'bg-emerald-500', icon: '📈' },
          { label: 'Total Expense', value: formatCurrency(stats.expense), color: 'bg-rose-500', icon: '📉' },
          { label: 'Net Savings', value: formatCurrency(stats.balance), color: stats.balance >= 0 ? 'bg-blue-500' : 'bg-orange-500', icon: '💰' },
          { label: 'Savings Rate', value: `${stats.savingsRate}%`, color: 'bg-purple-500', icon: '🎯' },
        ].map((s, i) => (
          <div key={i} className={`${s.color} rounded-2xl p-4 text-white shadow-lg`}>
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className="text-white/80 text-xs font-medium">{s.label}</p>
            <p className="font-bold text-lg">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Chart 1: Income vs Expense */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Income vs Expense (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={last6Months} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="#F97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2 + 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Spending by Category</h3>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <div className="text-center">
                <p className="text-3xl mb-2">📊</p>
                <p className="text-sm">No expense data</p>
              </div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="amount"
                    paddingAngle={3}
                  >
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-sm">{cat.icon}</span>
                    <span className="text-xs text-gray-600 flex-1 truncate">{cat.name}</span>
                    <span className="text-xs font-bold text-gray-800">{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Daily trend */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Daily Spending Trend</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={dailyTrend}>
              <defs>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="expense"
                name="Expense"
                stroke="#F97316"
                strokeWidth={2}
                fill="url(#expGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 4: Budget vs Actual */}
      {budgetVsActual.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Budget vs Actual (This Month)</h3>
          <ResponsiveContainer width="100%" height={Math.max(180, budgetVsActual.length * 55)}>
            <BarChart data={budgetVsActual} layout="vertical" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill="#6366F1" radius={[0, 6, 6, 0]} />
              <Bar dataKey="actual" name="Actual" fill="#F97316" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top 5 Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Top 5 Expenses</h3>
        {top5.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-sm">No expenses in this period</p>
          </div>
        ) : (
          <div className="space-y-3">
            {top5.map((txn, i) => {
              const cat = getCategoryById(categories, txn.categoryId)
              return (
                <div key={txn.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center text-xs font-bold text-gray-400 bg-gray-100 rounded-full">
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0" style={{ background: cat.color + '20' }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{txn.note || cat.name}</p>
                    <p className="text-xs text-gray-400">{format(new Date(txn.date), 'dd MMM yyyy')}</p>
                  </div>
                  <span className="font-bold text-rose-600">{formatCurrency(txn.amount)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
