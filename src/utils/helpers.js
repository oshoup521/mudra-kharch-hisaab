import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function formatCurrency(amount, currency = '₹') {
  if (amount === undefined || amount === null) return `${currency}0`
  const num = Math.abs(Number(amount))
  // Indian number system: last 3 digits, then groups of 2
  const parts = num.toFixed(0).split('.')
  let intPart = parts[0]
  let result = ''
  if (intPart.length > 3) {
    const last3 = intPart.slice(-3)
    const rest = intPart.slice(0, -3)
    result = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3
  } else {
    result = intPart
  }
  return `${currency}${result}`
}

export function formatDate(date, fmt = 'dd MMM yyyy') {
  if (!date) return ''
  try {
    return format(new Date(date), fmt)
  } catch {
    return ''
  }
}

export function getMonthYear(date) {
  if (!date) return ''
  try {
    return format(new Date(date), 'MMM yyyy')
  } catch {
    return ''
  }
}

export function getDateRange(period) {
  const now = new Date()
  switch (period) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'year':
      return { start: startOfYear(now), end: endOfYear(now) }
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) }
  }
}

export function groupByDate(transactions) {
  const groups = {}
  transactions.forEach(txn => {
    const dateKey = format(new Date(txn.date), 'yyyy-MM-dd')
    if (!groups[dateKey]) groups[dateKey] = []
    groups[dateKey].push(txn)
  })
  // Sort by date descending
  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .reduce((acc, [key, val]) => {
      acc[key] = val
      return acc
    }, {})
}

export function calculateStats(transactions) {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = income - expense
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0
  return { income, expense, balance, savingsRate }
}

export function filterTransactions(transactions, { search, type, categoryId, tagId, startDate, endDate }) {
  return transactions.filter(txn => {
    if (search) {
      const s = search.toLowerCase()
      if (!txn.note?.toLowerCase().includes(s) && !txn.categoryId?.toLowerCase().includes(s)) return false
    }
    if (type && type !== 'all') {
      if (txn.type !== type) return false
    }
    if (categoryId && categoryId !== 'all') {
      if (txn.categoryId !== categoryId) return false
    }
    if (tagId && tagId !== 'all') {
      if (!txn.tags?.includes(tagId)) return false
    }
    if (startDate) {
      if (new Date(txn.date) < new Date(startDate)) return false
    }
    if (endDate) {
      if (new Date(txn.date) > new Date(endDate)) return false
    }
    return true
  })
}

export function getCategoryById(categories, id) {
  return categories.find(c => c.id === id) || { id: 'other', name: 'Other', icon: '📦', color: '#94A3B8', type: 'expense' }
}
