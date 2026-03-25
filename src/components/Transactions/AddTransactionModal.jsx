import React, { useState, useEffect } from 'react'
import Modal from '../shared/Modal.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { generateId, formatDate } from '../../utils/helpers.js'
import { format } from 'date-fns'

const defaultForm = {
  type: 'expense',
  amount: '',
  categoryId: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  tags: [],
  note: '',
}

export default function AddTransactionModal({ isOpen, onClose, editData = null }) {
  const { categories, tags, addTransaction, updateTransaction } = useApp()
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setForm({
          type: editData.type || 'expense',
          amount: String(editData.amount || ''),
          categoryId: editData.categoryId || '',
          date: editData.date ? format(new Date(editData.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
          tags: editData.tags || [],
          note: editData.note || '',
        })
      } else {
        setForm({ ...defaultForm, date: format(new Date(), 'yyyy-MM-dd') })
      }
      setErrors({})
    }
  }, [isOpen, editData])

  const filteredCategories = categories.filter(c => c.type === form.type)

  const validate = () => {
    const errs = {}
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      errs.amount = 'Enter a valid amount'
    }
    if (!form.categoryId) errs.categoryId = 'Select a category'
    if (!form.date) errs.date = 'Select a date'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    const data = {
      ...form,
      amount: Number(form.amount),
      date: new Date(form.date).toISOString(),
    }
    if (editData) {
      updateTransaction({ ...editData, ...data })
    } else {
      addTransaction(data)
    }
    onClose()
  }

  const toggleTag = (tagId) => {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tagId) ? f.tags.filter(t => t !== tagId) : [...f.tags, tagId],
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Transaction' : 'Add Transaction'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4 pb-4">
        {/* Type Toggle */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {['expense', 'income'].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm(f => ({ ...f, type: t, categoryId: '' }))}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                form.type === t
                  ? t === 'income'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-rose-500 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'income' ? '📈 Income' : '📉 Expense'}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₹</span>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="0"
              className={`w-full pl-10 pr-4 py-3 text-2xl font-bold border-2 rounded-xl focus:ring-2 focus:ring-orange-300 transition-colors ${
                errors.amount ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-orange-400'
              }`}
            />
          </div>
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {filteredCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setForm(f => ({ ...f, categoryId: cat.id }))}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                  form.categoryId === cat.id
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                <span className="text-xs text-gray-600 text-center leading-tight">{cat.name}</span>
              </button>
            ))}
          </div>
          {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className={`w-full px-4 py-2.5 border-2 rounded-xl focus:ring-2 focus:ring-orange-300 transition-colors ${
              errors.date ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'
            }`}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all ${
                  form.tags.includes(tag.id)
                    ? 'text-white border-transparent'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
                style={form.tags.includes(tag.id) ? { background: tag.color, borderColor: tag.color } : {}}
              >
                #{tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note</label>
          <textarea
            value={form.note}
            onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            placeholder="Add a note (optional)"
            rows={2}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-colors resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-bold text-base shadow-lg transition-all hover:shadow-xl active:scale-95"
          style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
        >
          {editData ? 'Update Transaction' : 'Add Transaction'}
        </button>
      </form>
    </Modal>
  )
}
