import React, { useState } from 'react'
import { Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency, getCategoryById } from '../../utils/helpers.js'
import Modal from '../shared/Modal.jsx'
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { CATEGORY_COLORS, EMOJI_LIST } from '../../utils/constants.js'

const defaultForm = { name: '', icon: '📦', color: '#F97316', type: 'expense' }

export default function Categories() {
  const { categories, transactions, addCategory, updateCategory, deleteCategory } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filterType, setFilterType] = useState('all')

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const getCatStats = (catId) => {
    const catTxns = transactions.filter(t => t.categoryId === catId)
    const monthTxns = catTxns.filter(t => isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd }))
    const totalSpent = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    return { count: catTxns.length, monthCount: monthTxns.length, totalSpent }
  }

  const openAdd = () => {
    setEditCat(null)
    setForm(defaultForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (cat) => {
    setEditCat(cat)
    setForm({ name: cat.name, icon: cat.icon, color: cat.color, type: cat.type })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Category name is required'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    if (editCat) {
      updateCategory({ ...editCat, ...form })
    } else {
      addCategory(form)
    }
    setModalOpen(false)
  }

  const handleDelete = (catId) => {
    const stats = getCatStats(catId)
    if (stats.count > 0) {
      alert(`Cannot delete: This category has ${stats.count} transaction(s). Please reassign or delete those first.`)
      setDeleteConfirm(null)
      return
    }
    deleteCategory(catId)
    setDeleteConfirm(null)
  }

  const filtered = categories.filter(c => filterType === 'all' || c.type === filterType)

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-500 text-sm mt-0.5">{categories.length} categories total</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all hover:shadow-xl active:scale-95"
          style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'expense', 'income'].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filterType === t ? 'text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
            style={filterType === t ? { background: 'linear-gradient(135deg, #F97316, #EA580C)' } : {}}
          >
            {t === 'all' ? 'All' : t === 'expense' ? '📉 Expense' : '📈 Income'}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filtered.map(cat => {
          const stats = getCatStats(cat.id)
          return (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                  style={{ background: cat.color + '20' }}
                >
                  {cat.icon}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(cat)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(cat.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              <p className="font-bold text-gray-800 text-sm truncate">{cat.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">{stats.count} transactions</p>

              <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    cat.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {cat.type}
                </span>
                {stats.totalSpent > 0 && (
                  <span className="text-xs font-bold text-gray-700">{formatCurrency(stats.totalSpent)}</span>
                )}
              </div>
            </div>
          )
        })}

        {/* Add new card */}
        <button
          onClick={openAdd}
          className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 p-4 hover:border-orange-300 hover:bg-orange-50 transition-all flex flex-col items-center justify-center gap-2 min-h-[140px] group"
        >
          <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
            <Plus size={20} className="text-gray-400 group-hover:text-orange-500" />
          </div>
          <span className="text-sm font-medium text-gray-400 group-hover:text-orange-500 transition-colors">Add Category</span>
        </button>
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCat ? 'Edit Category' : 'Add Category'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Khana-Peena"
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-orange-300 transition-colors ${
                errors.name ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Type</label>
            <div className="flex gap-2">
              {['expense', 'income'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                    form.type === t
                      ? t === 'income'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'bg-rose-500 border-rose-500 text-white'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {t === 'income' ? '📈 Income' : '📉 Expense'}
                </button>
              ))}
            </div>
          </div>

          {/* Emoji picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Icon <span className="text-2xl">{form.icon}</span></label>
            <div className="grid grid-cols-10 gap-1 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-gray-200">
              {EMOJI_LIST.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, icon: emoji }))}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg transition-all hover:bg-orange-100 ${
                    form.icon === emoji ? 'bg-orange-200 ring-2 ring-orange-400' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color }))}
                  className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${
                    form.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                  }`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl text-white font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
          >
            {editCat ? 'Update Category' : 'Add Category'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-scale-in">
            {getCatStats(deleteConfirm).count > 0 ? (
              <>
                <AlertCircle size={40} className="text-amber-500 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 text-center text-lg mb-2">Cannot Delete</h3>
                <p className="text-gray-500 text-sm text-center mb-5">
                  This category has {getCatStats(deleteConfirm).count} transaction(s). Please delete those transactions first.
                </p>
                <button onClick={() => setDeleteConfirm(null)} className="w-full py-2.5 bg-gray-100 rounded-xl text-gray-700 font-semibold">
                  OK
                </button>
              </>
            ) : (
              <>
                <p className="text-4xl text-center mb-3">🗑️</p>
                <h3 className="font-bold text-gray-900 text-center text-lg mb-2">Delete Category?</h3>
                <p className="text-gray-500 text-sm text-center mb-5">This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold">Cancel</button>
                  <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 rounded-xl text-white font-semibold">Delete</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
