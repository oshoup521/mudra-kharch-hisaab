import React, { useState } from 'react'
import { Plus, CheckCircle, Pencil, Trash2, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency, formatDate, generateId } from '../../utils/helpers.js'
import Modal from '../shared/Modal.jsx'
import { format } from 'date-fns'

const defaultForm = {
  personName: '', amount: '', type: 'lent',
  date: format(new Date(), 'yyyy-MM-dd'),
  dueDate: '', note: '', status: 'pending',
}

const defaultSettleForm = { amount: '', note: '', date: format(new Date(), 'yyyy-MM-dd') }

export default function Ledger() {
  const { ledger, addLedgerEntry, updateLedgerEntry, deleteLedgerEntry } = useApp()
  const [activeTab, setActiveTab] = useState('lent')
  const [modalOpen, setModalOpen] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [settleModal, setSettleModal] = useState(null)
  const [settleForm, setSettleForm] = useState(defaultSettleForm)
  const [settleErrors, setSettleErrors] = useState({})
  const [expandedId, setExpandedId] = useState(null)

  const lentEntries = ledger.filter(e => e.type === 'lent')
  const borrowedEntries = ledger.filter(e => e.type === 'borrowed')

  const totalToReceive = lentEntries
    .filter(e => e.status !== 'settled')
    .reduce((s, e) => {
      const settled = e.settlements?.reduce((ss, st) => ss + Number(st.amount), 0) || 0
      return s + Number(e.amount) - settled
    }, 0)

  const totalToGive = borrowedEntries
    .filter(e => e.status !== 'settled')
    .reduce((s, e) => {
      const settled = e.settlements?.reduce((ss, st) => ss + Number(st.amount), 0) || 0
      return s + Number(e.amount) - settled
    }, 0)

  const getRemainingAmount = (entry) => {
    const settled = entry.settlements?.reduce((s, t) => s + Number(t.amount), 0) || 0
    return Number(entry.amount) - settled
  }

  const openAdd = () => {
    setEditEntry(null)
    setForm({ ...defaultForm, type: activeTab === 'lent' ? 'lent' : 'borrowed' })
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (entry) => {
    setEditEntry(entry)
    setForm({
      personName: entry.personName,
      amount: String(entry.amount),
      type: entry.type,
      date: format(new Date(entry.date), 'yyyy-MM-dd'),
      dueDate: entry.dueDate ? format(new Date(entry.dueDate), 'yyyy-MM-dd') : '',
      note: entry.note || '',
      status: entry.status,
    })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.personName.trim()) errs.personName = 'Person name is required'
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    const data = {
      ...form,
      amount: Number(form.amount),
      date: new Date(form.date).toISOString(),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    }
    if (editEntry) {
      updateLedgerEntry({ ...editEntry, ...data })
    } else {
      addLedgerEntry(data)
    }
    setModalOpen(false)
  }

  const openSettle = (entry) => {
    setSettleModal(entry)
    const remaining = getRemainingAmount(entry)
    setSettleForm({ amount: String(remaining), note: '', date: format(new Date(), 'yyyy-MM-dd') })
    setSettleErrors({})
  }

  const handleSettle = (e) => {
    e.preventDefault()
    const errs = {}
    if (!settleForm.amount || Number(settleForm.amount) <= 0) errs.amount = 'Enter valid amount'
    const remaining = getRemainingAmount(settleModal)
    if (Number(settleForm.amount) > remaining) errs.amount = `Max: ${formatCurrency(remaining)}`
    if (Object.keys(errs).length > 0) { setSettleErrors(errs); return }

    const newSettlement = {
      id: generateId(),
      amount: Number(settleForm.amount),
      date: new Date(settleForm.date).toISOString(),
      note: settleForm.note,
    }

    const newSettlements = [...(settleModal.settlements || []), newSettlement]
    const totalSettled = newSettlements.reduce((s, t) => s + Number(t.amount), 0)
    const newStatus = totalSettled >= Number(settleModal.amount) ? 'settled' : 'partial'

    updateLedgerEntry({ ...settleModal, settlements: newSettlements, status: newStatus })
    setSettleModal(null)
  }

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    partial: 'bg-blue-100 text-blue-700',
    settled: 'bg-emerald-100 text-emerald-700',
  }

  const displayEntries = activeTab === 'lent' ? lentEntries : borrowedEntries

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Udhaari Tracker</h2>
          <p className="text-gray-500 text-sm">उधारी का हिसाब</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
        >
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-emerald-600 font-semibold mb-1">Pane Hain</p>
          <p className="text-xs text-emerald-500 mb-2">(To Receive)</p>
          <p className="font-bold text-emerald-700 text-base">{formatCurrency(totalToReceive)}</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-rose-600 font-semibold mb-1">Dene Hain</p>
          <p className="text-xs text-rose-500 mb-2">(To Give)</p>
          <p className="font-bold text-rose-700 text-base">{formatCurrency(totalToGive)}</p>
        </div>
        <div className={`rounded-2xl p-4 text-center border ${
          totalToReceive - totalToGive >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
        }`}>
          <p className={`text-xs font-semibold mb-1 ${totalToReceive - totalToGive >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net Balance</p>
          <p className={`text-xs mb-2 ${totalToReceive - totalToGive >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
            {totalToReceive - totalToGive >= 0 ? 'In your favor' : 'You owe more'}
          </p>
          <p className={`font-bold text-base ${totalToReceive - totalToGive >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {formatCurrency(Math.abs(totalToReceive - totalToGive))}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
        <button
          onClick={() => setActiveTab('lent')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'lent' ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={activeTab === 'lent' ? { background: 'linear-gradient(135deg, #10B981, #059669)' } : {}}
        >
          💸 Diya (दिया)
          <span className="ml-2 text-xs opacity-80">({lentEntries.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('borrowed')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'borrowed' ? 'text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
          style={activeTab === 'borrowed' ? { background: 'linear-gradient(135deg, #EF4444, #DC2626)' } : {}}
        >
          🤝 Liya (लिया)
          <span className="ml-2 text-xs opacity-80">({borrowedEntries.length})</span>
        </button>
      </div>

      {/* Entries */}
      {displayEntries.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-3">{activeTab === 'lent' ? '💸' : '🤝'}</p>
          <p className="font-semibold text-gray-700 text-lg">
            {activeTab === 'lent' ? 'No money lent' : 'No money borrowed'}
          </p>
          <p className="text-gray-400 text-sm mt-1 mb-4">
            {activeTab === 'lent' ? 'Track money you\'ve lent to others' : 'Track money you\'ve borrowed from others'}
          </p>
          <button onClick={openAdd} className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
            Add Entry
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {displayEntries.map(entry => {
            const remaining = getRemainingAmount(entry)
            const settled = (entry.settlements || []).reduce((s, t) => s + Number(t.amount), 0)
            const isExpanded = expandedId === entry.id
            const isLent = entry.type === 'lent'

            return (
              <div
                key={entry.id}
                className={`bg-white rounded-2xl shadow-sm border transition-all ${
                  entry.status === 'settled'
                    ? 'border-gray-100 opacity-70'
                    : isLent ? 'border-emerald-100' : 'border-rose-100'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm"
                      style={{ background: isLent ? '#10B981' : '#EF4444' }}
                    >
                      {entry.personName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-bold text-gray-800 ${entry.status === 'settled' ? 'line-through text-gray-400' : ''}`}>
                          {entry.personName}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColors[entry.status]}`}>
                          {entry.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {format(new Date(entry.date), 'dd MMM yyyy')}
                        {entry.dueDate && ` · Due: ${format(new Date(entry.dueDate), 'dd MMM yyyy')}`}
                      </p>
                      {entry.note && <p className="text-gray-500 text-xs mt-1 italic">"{entry.note}"</p>}
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <p className={`font-bold text-lg ${isLent ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(entry.amount)}
                      </p>
                      {entry.status !== 'settled' && settled > 0 && (
                        <p className="text-xs text-gray-400">
                          Remaining: {formatCurrency(remaining)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    {entry.status !== 'settled' && (
                      <button
                        onClick={() => openSettle(entry)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold hover:bg-emerald-600 transition-colors"
                      >
                        <CheckCircle size={12} /> Settle
                      </button>
                    )}
                    {(entry.settlements || []).length > 0 && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors"
                      >
                        History {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                    <div className="flex-1" />
                    <button onClick={() => openEdit(entry)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => setDeleteConfirm(entry.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {/* Settlement history */}
                  {isExpanded && (entry.settlements || []).length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Settlement History</p>
                      {entry.settlements.map(s => (
                        <div key={s.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5">
                          <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-600">{s.note || 'Settlement'}</p>
                            <p className="text-xs text-gray-400">{format(new Date(s.date), 'dd MMM yyyy')}</p>
                          </div>
                          <p className="text-sm font-bold text-emerald-600">{formatCurrency(s.amount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editEntry ? 'Edit Entry' : 'Add Ledger Entry'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {[
              { value: 'lent', label: '💸 Diya (Lent)' },
              { value: 'borrowed', label: '🤝 Liya (Borrowed)' },
            ].map(t => (
              <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, type: t.value }))}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  form.type === t.value
                    ? t.value === 'lent' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                    : 'text-gray-500'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Person Name</label>
            <input type="text" value={form.personName} onChange={e => setForm(f => ({ ...f, personName: e.target.value }))}
              placeholder="e.g. Amit Sharma"
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 ${errors.personName ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'}`} />
            {errors.personName && <p className="text-red-500 text-xs mt-1">{errors.personName}</p>}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Due Date (opt.)</label>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note (optional)</label>
            <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="What is this for?"
              rows={2}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 text-sm" />
          </div>

          <button type="submit" className="w-full py-3 rounded-xl text-white font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
            {editEntry ? 'Update Entry' : 'Add Entry'}
          </button>
        </form>
      </Modal>

      {/* Settle Modal */}
      {settleModal && (
        <Modal isOpen={true} onClose={() => setSettleModal(null)} title={`Settle with ${settleModal.personName}`} size="sm">
          <form onSubmit={handleSettle} className="space-y-4 pb-4">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-sm text-gray-500">Remaining amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(getRemainingAmount(settleModal))}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Settlement Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₹</span>
                <input type="number" value={settleForm.amount} onChange={e => setSettleForm(f => ({ ...f, amount: e.target.value }))}
                  className={`w-full pl-8 pr-4 py-2.5 border-2 rounded-xl text-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-300 ${settleErrors.amount ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'}`} />
              </div>
              {settleErrors.amount && <p className="text-red-500 text-xs mt-1">{settleErrors.amount}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
              <input type="date" value={settleForm.date} onChange={e => setSettleForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note (optional)</label>
              <input type="text" value={settleForm.note} onChange={e => setSettleForm(f => ({ ...f, note: e.target.value }))}
                placeholder="e.g. Paid via UPI"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400" />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg transition-colors">
              Record Settlement
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-scale-in">
            <p className="text-4xl text-center mb-3">🗑️</p>
            <h3 className="font-bold text-gray-900 text-center text-lg mb-2">Delete Entry?</h3>
            <p className="text-gray-500 text-sm text-center mb-5">All settlement history will also be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold">Cancel</button>
              <button onClick={() => { deleteLedgerEntry(deleteConfirm); setDeleteConfirm(null) }} className="flex-1 py-2.5 bg-red-500 rounded-xl text-white font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
