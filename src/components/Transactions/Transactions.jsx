import React, { useState, useMemo } from 'react'
import { Search, Filter, Pencil, Trash2, ChevronDown } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency, formatDate, groupByDate, calculateStats, getCategoryById, filterTransactions, getDateRange } from '../../utils/helpers.js'
import { format } from 'date-fns'
import AddTransactionModal from './AddTransactionModal.jsx'

const PERIOD_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom' },
]

export default function Transactions() {
  const { transactions, categories, tags, deleteTransaction } = useApp()
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('month')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTxn, setEditTxn] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const { startDate, endDate } = useMemo(() => {
    if (period === 'all') return { startDate: null, endDate: null }
    if (period === 'custom') return { startDate: customStart || null, endDate: customEnd || null }
    const range = getDateRange(period)
    return { startDate: range.start, endDate: range.end }
  }, [period, customStart, customEnd])

  const filtered = useMemo(() => {
    return filterTransactions(transactions, {
      search,
      type: typeFilter,
      categoryId: categoryFilter,
      tagId: tagFilter,
      startDate,
      endDate,
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [transactions, search, typeFilter, categoryFilter, tagFilter, startDate, endDate])

  const stats = calculateStats(filtered)
  const grouped = groupByDate(filtered)

  const handleEdit = (txn) => {
    setEditTxn(txn)
    setModalOpen(true)
  }

  const handleDelete = (id) => {
    deleteTransaction(id)
    setDeleteConfirm(null)
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 animate-fade-in">
      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Income</p>
          <p className="font-bold text-emerald-600">{formatCurrency(stats.income)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Expense</p>
          <p className="font-bold text-rose-600">{formatCurrency(stats.expense)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500 mb-1">Balance</p>
          <p className={`font-bold ${stats.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{formatCurrency(stats.balance)}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters ? 'bg-orange-50 border-orange-300 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Filter size={14} />
            Filters
          </button>
        </div>

        {/* Period Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === opt.value
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              style={period === opt.value ? { background: 'linear-gradient(135deg, #F97316, #EA580C)' } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {period === 'custom' && (
          <div className="flex gap-2">
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
            <span className="self-center text-gray-400 text-sm">to</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" />
          </div>
        )}

        {/* Advanced filters */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-100">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="all">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
              <option value="all">All Tags</option>
              {tags.map(t => <option key={t.id} value={t.id}>#{t.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-3">💸</p>
          <p className="font-semibold text-gray-700 text-lg">No transactions found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([dateKey, txns]) => (
            <div key={dateKey}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {format(new Date(dateKey), 'EEEE, d MMMM yyyy')}
                </span>
                <div className="flex-1 border-t border-gray-100" />
                <span className="text-xs text-gray-400">
                  {txns.filter(t => t.type === 'income').length > 0 && (
                    <span className="text-emerald-600 mr-2">+{formatCurrency(txns.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0))}</span>
                  )}
                  {txns.filter(t => t.type === 'expense').length > 0 && (
                    <span className="text-rose-600">-{formatCurrency(txns.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0))}</span>
                  )}
                </span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {txns.map((txn, idx) => {
                  const cat = getCategoryById(categories, txn.categoryId)
                  return (
                    <div
                      key={txn.id}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group ${
                        idx < txns.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: cat.color + '20' }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{txn.note || cat.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-gray-400 text-xs">{cat.name}</span>
                          {txn.tags?.map(tagId => {
                            const tag = tags.find(t => t.id === tagId)
                            if (!tag) return null
                            return (
                              <span
                                key={tagId}
                                className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium"
                                style={{ background: tag.color }}
                              >
                                #{tag.name}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${txn.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(txn)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(txn.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-scale-in">
            <p className="text-4xl text-center mb-3">🗑️</p>
            <h3 className="font-bold text-gray-900 text-center text-lg mb-2">Delete Transaction?</h3>
            <p className="text-gray-500 text-sm text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 rounded-xl text-white font-semibold hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTxn(null) }}
        editData={editTxn}
      />
    </div>
  )
}
