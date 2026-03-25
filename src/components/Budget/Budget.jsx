import React, { useState, useEffect } from 'react'
import { Save, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency, getCategoryById } from '../../utils/helpers.js'
import ProgressBar from '../shared/ProgressBar.jsx'
import { startOfMonth, endOfMonth, isWithinInterval, getDaysInMonth } from 'date-fns'

export default function Budget() {
  const { transactions, categories, budgets, setBudget } = useApp()
  const [overallBudget, setOverallBudget] = useState(String(budgets.overall))
  const [catBudgets, setCatBudgets] = useState(() => {
    const obj = {}
    categories.filter(c => c.type === 'expense').forEach(c => {
      obj[c.id] = String(budgets.categories[c.id] || '')
    })
    return obj
  })
  const [saved, setSaved] = useState(false)

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const daysInMonth = getDaysInMonth(now)
  const daysPassed = now.getDate()
  const daysRemaining = daysInMonth - daysPassed

  const thisMonthExpenses = transactions.filter(t =>
    t.type === 'expense' &&
    isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
  )

  const totalSpent = thisMonthExpenses.reduce((s, t) => s + Number(t.amount), 0)
  const overallNum = Number(overallBudget) || 0
  const overallPct = overallNum > 0 ? (totalSpent / overallNum) * 100 : 0
  const remaining = overallNum - totalSpent
  const avgDailyBudget = overallNum / daysInMonth
  const avgDailySpend = daysPassed > 0 ? totalSpent / daysPassed : 0
  const projectedSpend = avgDailySpend * daysInMonth

  const handleSave = () => {
    const cats = {}
    Object.entries(catBudgets).forEach(([id, val]) => {
      if (val && Number(val) > 0) cats[id] = Number(val)
    })
    setBudget({ overall: Number(overallBudget) || 0, categories: cats })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const expenseCategories = categories.filter(c => c.type === 'expense')

  const getCatSpend = (catId) => {
    return thisMonthExpenses.filter(t => t.categoryId === catId).reduce((s, t) => s + Number(t.amount), 0)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Budget Planner</h2>
          <p className="text-gray-500 text-sm mt-0.5">{daysRemaining} days remaining this month</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all ${
            saved ? 'bg-emerald-500' : ''
          }`}
          style={!saved ? { background: 'linear-gradient(135deg, #F97316, #EA580C)' } : {}}
        >
          <Save size={15} />
          {saved ? 'Saved!' : 'Save Budget'}
        </button>
      </div>

      {/* Overall Budget */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Overall Monthly Budget</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Monthly Budget Limit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₹</span>
              <input
                type="number"
                value={overallBudget}
                onChange={e => setOverallBudget(e.target.value)}
                placeholder="80000"
                className="w-full pl-8 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
              />
            </div>
          </div>
        </div>

        <ProgressBar value={totalSpent} max={overallNum} height="h-3" className="mb-3" />

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-rose-50 rounded-xl p-3 text-center">
            <p className="text-xs text-rose-600 font-medium mb-1">Spent</p>
            <p className="font-bold text-rose-700 text-sm">{formatCurrency(totalSpent)}</p>
          </div>
          <div className={`rounded-xl p-3 text-center ${remaining >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <p className={`text-xs font-medium mb-1 ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {remaining >= 0 ? 'Remaining' : 'Overspent'}
            </p>
            <p className={`font-bold text-sm ${remaining >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatCurrency(Math.abs(remaining))}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-xs text-blue-600 font-medium mb-1">Used</p>
            <p className="font-bold text-blue-700 text-sm">{Math.round(overallPct)}%</p>
          </div>
        </div>
      </div>

      {/* Budget Health */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Budget Health</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-purple-50 rounded-xl p-3">
            <p className="text-xs text-purple-600 font-medium mb-1">Avg Daily Budget</p>
            <p className="font-bold text-purple-700">{formatCurrency(Math.round(avgDailyBudget))}</p>
            <p className="text-xs text-purple-400">per day</p>
          </div>
          <div className={`rounded-xl p-3 ${avgDailySpend > avgDailyBudget ? 'bg-red-50' : 'bg-emerald-50'}`}>
            <p className={`text-xs font-medium mb-1 ${avgDailySpend > avgDailyBudget ? 'text-red-600' : 'text-emerald-600'}`}>
              Avg Daily Spend
            </p>
            <p className={`font-bold ${avgDailySpend > avgDailyBudget ? 'text-red-700' : 'text-emerald-700'}`}>
              {formatCurrency(Math.round(avgDailySpend))}
            </p>
            <p className={`text-xs ${avgDailySpend > avgDailyBudget ? 'text-red-400' : 'text-emerald-400'}`}>per day</p>
          </div>
          <div className={`rounded-xl p-3 ${projectedSpend > overallNum ? 'bg-amber-50' : 'bg-emerald-50'}`}>
            <p className={`text-xs font-medium mb-1 ${projectedSpend > overallNum ? 'text-amber-600' : 'text-emerald-600'}`}>
              Projected Spend
            </p>
            <p className={`font-bold ${projectedSpend > overallNum ? 'text-amber-700' : 'text-emerald-700'}`}>
              {formatCurrency(Math.round(projectedSpend))}
            </p>
            <p className={`text-xs ${projectedSpend > overallNum ? 'text-amber-400' : 'text-emerald-400'}`}>this month</p>
          </div>
          <div className={`rounded-xl p-3 ${projectedSpend > overallNum ? 'bg-red-50' : 'bg-blue-50'}`}>
            <p className={`text-xs font-medium mb-1 ${projectedSpend > overallNum ? 'text-red-600' : 'text-blue-600'}`}>
              {projectedSpend > overallNum ? 'Projected Over' : 'Projected Save'}
            </p>
            <p className={`font-bold ${projectedSpend > overallNum ? 'text-red-700' : 'text-blue-700'}`}>
              {formatCurrency(Math.abs(Math.round(overallNum - projectedSpend)))}
            </p>
            <p className={`text-xs ${projectedSpend > overallNum ? 'text-red-400' : 'text-blue-400'}`}>
              {projectedSpend > overallNum ? 'over budget' : 'under budget'}
            </p>
          </div>
        </div>

        {projectedSpend > overallNum && (
          <div className="mt-3 flex items-center gap-2 bg-amber-50 rounded-xl p-3 border border-amber-200">
            <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
            <p className="text-amber-700 text-sm font-medium">
              At current spending rate, you'll overshoot by {formatCurrency(Math.round(projectedSpend - overallNum))} this month.
            </p>
          </div>
        )}
      </div>

      {/* Category Budgets */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Category Budgets</h3>
        <div className="space-y-4">
          {expenseCategories.map(cat => {
            const spent = getCatSpend(cat.id)
            const budget = Number(catBudgets[cat.id]) || 0
            const pct = budget > 0 ? (spent / budget) * 100 : 0
            return (
              <div key={cat.id} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: cat.color + '20' }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{cat.name}</p>
                    <p className="text-gray-400 text-xs">Spent: {formatCurrency(spent)}</p>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">₹</span>
                    <input
                      type="number"
                      value={catBudgets[cat.id] || ''}
                      onChange={e => setCatBudgets(p => ({ ...p, [cat.id]: e.target.value }))}
                      placeholder="Budget"
                      className="w-full pl-7 pr-2 py-2 border-2 border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
                    />
                  </div>
                </div>
                {budget > 0 && (
                  <>
                    <ProgressBar value={spent} max={budget} height="h-2" showPercent={false} />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">{formatCurrency(spent)} spent</span>
                      <span className={`text-xs font-semibold ${pct >= 100 ? 'text-red-600' : pct >= 75 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {Math.round(pct)}% of {formatCurrency(budget)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <button
          onClick={handleSave}
          className={`mt-4 w-full py-3 rounded-xl text-white font-bold shadow-lg transition-all ${saved ? 'bg-emerald-500' : ''}`}
          style={!saved ? { background: 'linear-gradient(135deg, #F97316, #EA580C)' } : {}}
        >
          {saved ? '✓ Budget Saved!' : 'Save All Budgets'}
        </button>
      </div>
    </div>
  )
}
