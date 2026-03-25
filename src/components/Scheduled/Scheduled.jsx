import React, { useState } from 'react'
import { Plus, Play, Pause, CheckCircle, Pencil, Trash2, Bell } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency, getCategoryById, formatDate } from '../../utils/helpers.js'
import Modal from '../shared/Modal.jsx'
import { format, isSameDay, isToday, isBefore, addDays } from 'date-fns'

const defaultForm = {
  name: '', amount: '', type: 'expense', categoryId: '',
  frequency: 'monthly', startDate: format(new Date(), 'yyyy-MM-dd'),
  endDate: '', note: '', active: true, tags: [],
}

export default function Scheduled() {
  const { scheduled, categories, tags, addScheduled, updateScheduled, deleteScheduled, addTransaction } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [doneConfirm, setDoneConfirm] = useState(null)

  const now = new Date()

  const dueToday = scheduled.filter(s => {
    if (!s.active) return false
    const due = new Date(s.nextDue)
    return isToday(due) || isBefore(due, now)
  })

  const openAdd = () => {
    setEditItem(null)
    setForm(defaultForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditItem(item)
    setForm({
      name: item.name,
      amount: String(item.amount),
      type: item.type,
      categoryId: item.categoryId,
      frequency: item.frequency,
      startDate: format(new Date(item.startDate), 'yyyy-MM-dd'),
      endDate: item.endDate ? format(new Date(item.endDate), 'yyyy-MM-dd') : '',
      note: item.note || '',
      active: item.active,
      tags: item.tags || [],
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount'
    if (!form.categoryId) errs.categoryId = 'Select a category'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const nextDue = new Date(form.startDate)
    const data = {
      ...form,
      amount: Number(form.amount),
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      nextDue: nextDue.toISOString(),
    }
    if (editItem) {
      updateScheduled({ ...editItem, ...data })
    } else {
      addScheduled(data)
    }
    setModalOpen(false)
  }

  const handleMarkDone = (item) => {
    addTransaction({
      type: item.type,
      amount: item.amount,
      categoryId: item.categoryId,
      date: new Date().toISOString(),
      note: item.name + ' (scheduled)',
      tags: item.tags || [],
    })
    // Advance nextDue
    const next = advanceDate(new Date(item.nextDue), item.frequency)
    updateScheduled({ ...item, nextDue: next.toISOString() })
    setDoneConfirm(null)
  }

  const advanceDate = (date, frequency) => {
    const d = new Date(date)
    switch (frequency) {
      case 'daily': return addDays(d, 1)
      case 'weekly': return addDays(d, 7)
      case 'monthly': return new Date(d.setMonth(d.getMonth() + 1))
      case 'yearly': return new Date(d.setFullYear(d.getFullYear() + 1))
      default: return addDays(d, 30)
    }
  }

  const toggleActive = (item) => {
    updateScheduled({ ...item, active: !item.active })
  }

  const freqColor = {
    daily: 'bg-blue-100 text-blue-700',
    weekly: 'bg-purple-100 text-purple-700',
    monthly: 'bg-orange-100 text-orange-700',
    yearly: 'bg-emerald-100 text-emerald-700',
  }

  const filteredCats = categories.filter(c => c.type === form.type)

  const grouped = scheduled.reduce((acc, item) => {
    const freq = item.frequency
    if (!acc[freq]) acc[freq] = []
    acc[freq].push(item)
    return acc
  }, {})

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Scheduled Transactions</h2>
          <p className="text-gray-500 text-sm">{scheduled.length} recurring items</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Due Today */}
      {dueToday.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-amber-600" />
            <h3 className="font-bold text-amber-800">{dueToday.length} item{dueToday.length > 1 ? 's' : ''} due today!</h3>
          </div>
          <div className="space-y-2">
            {dueToday.map(item => {
              const cat = getCategoryById(categories, item.categoryId)
              return (
                <div key={item.id} className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: cat.color + '20' }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                    <p className="text-gray-400 text-xs">{cat.name}</p>
                  </div>
                  <span className={`font-bold text-sm ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {formatCurrency(item.amount)}
                  </span>
                  <button
                    onClick={() => setDoneConfirm(item)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600"
                  >
                    <CheckCircle size={12} /> Done
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Grouped list */}
      {scheduled.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-3">📅</p>
          <p className="font-semibold text-gray-700 text-lg">No scheduled transactions</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Set up recurring bills, EMIs, and SIPs</p>
          <button onClick={openAdd} className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
            Add First Schedule
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([freq, items]) => (
          <div key={freq}>
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
              {freq}
            </h3>
            <div className="space-y-2">
              {items.map(item => {
                const cat = getCategoryById(categories, item.categoryId)
                const isDue = isToday(new Date(item.nextDue)) || isBefore(new Date(item.nextDue), now)
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-3 transition-all ${
                      !item.active ? 'opacity-60 border-gray-100' : isDue ? 'border-amber-200' : 'border-gray-100'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: cat.color + '20' }}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${freqColor[item.frequency]}`}>
                          {item.frequency}
                        </span>
                        {!item.active && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">paused</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">
                        Next due: {format(new Date(item.nextDue), 'dd MMM yyyy')}
                        {item.note && ` · ${item.note}`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`font-bold text-sm ${item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => toggleActive(item)}
                          className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                            item.active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                          title={item.active ? 'Pause' : 'Resume'}
                        >
                          {item.active ? <Pause size={11} /> : <Play size={11} />}
                        </button>
                        <button onClick={() => openEdit(item)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                          <Pencil size={11} />
                        </button>
                        <button onClick={() => setDeleteConfirm(item.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Schedule' : 'New Schedule'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. House Rent"
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 ${errors.name ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="flex bg-gray-100 rounded-xl p-1">
            {['expense', 'income'].map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t, categoryId: '' }))}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  form.type === t ? (t === 'income' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'text-gray-500'
                }`}>
                {t === 'income' ? '📈 Income' : '📉 Expense'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₹</span>
              <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0"
                className={`w-full pl-8 pr-4 py-2.5 border-2 rounded-xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-300 ${errors.amount ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'}`} />
            </div>
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {filteredCats.map(cat => (
                <button key={cat.id} type="button" onClick={() => setForm(f => ({ ...f, categoryId: cat.id }))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                    form.categoryId === cat.id ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}>
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-xs text-gray-600 text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
            {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Frequency</label>
            <div className="grid grid-cols-4 gap-2">
              {['daily','weekly','monthly','yearly'].map(f => (
                <button key={f} type="button" onClick={() => setForm(p => ({ ...p, frequency: f }))}
                  className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                    form.frequency === f ? 'border-orange-400 bg-orange-50 text-orange-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date (opt.)</label>
              <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note (optional)</label>
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Add a note..." rows={2}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-sm" />
          </div>

          <button type="submit" className="w-full py-3 rounded-xl text-white font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
            {editItem ? 'Update Schedule' : 'Create Schedule'}
          </button>
        </form>
      </Modal>

      {/* Mark Done Confirm */}
      {doneConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDoneConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-scale-in">
            <p className="text-4xl text-center mb-3">✅</p>
            <h3 className="font-bold text-gray-900 text-center text-lg mb-2">Mark as Done?</h3>
            <p className="text-gray-500 text-sm text-center mb-1">This will create a transaction for:</p>
            <p className="text-center font-bold text-gray-800 mb-5">{doneConfirm.name} - {formatCurrency(doneConfirm.amount)}</p>
            <div className="flex gap-3">
              <button onClick={() => setDoneConfirm(null)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold">Cancel</button>
              <button onClick={() => handleMarkDone(doneConfirm)} className="flex-1 py-2.5 bg-emerald-500 rounded-xl text-white font-semibold">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-scale-in">
            <p className="text-4xl text-center mb-3">🗑️</p>
            <h3 className="font-bold text-gray-900 text-center text-lg mb-2">Delete Schedule?</h3>
            <p className="text-gray-500 text-sm text-center mb-5">This will remove the recurring transaction.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold">Cancel</button>
              <button onClick={() => { deleteScheduled(deleteConfirm); setDeleteConfirm(null) }} className="flex-1 py-2.5 bg-red-500 rounded-xl text-white font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
