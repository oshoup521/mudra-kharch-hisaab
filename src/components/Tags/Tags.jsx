import React, { useState } from 'react'
import { Plus, Pencil, Trash2, ArrowRight } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { formatCurrency } from '../../utils/helpers.js'
import Modal from '../shared/Modal.jsx'
import { CATEGORY_COLORS } from '../../utils/constants.js'

const defaultForm = { name: '', color: '#F97316' }

export default function Tags() {
  const { tags, transactions, addTag, updateTag, deleteTag, setPage } = useApp()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTag, setEditTag] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [errors, setErrors] = useState({})
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const getTagStats = (tagId) => {
    const tagTxns = transactions.filter(t => t.tags?.includes(tagId))
    const totalAmount = tagTxns.reduce((s, t) => s + Number(t.amount), 0)
    return { count: tagTxns.length, totalAmount }
  }

  const openAdd = () => {
    setEditTag(null)
    setForm(defaultForm)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (tag) => {
    setEditTag(tag)
    setForm({ name: tag.name, color: tag.color })
    setErrors({})
    setModalOpen(true)
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Tag name is required'
    if (form.name.trim().length > 20) errs.name = 'Max 20 characters'
    return errs
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    if (editTag) {
      updateTag({ ...editTag, ...form })
    } else {
      addTag(form)
    }
    setModalOpen(false)
  }

  const handleDelete = (tagId) => {
    deleteTag(tagId)
    setDeleteConfirm(null)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Tags</h2>
          <p className="text-gray-500 text-sm">{tags.length} tags</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg"
          style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
        >
          <Plus size={16} /> Add Tag
        </button>
      </div>

      {/* Tags Grid */}
      {tags.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-5xl mb-3">🏷️</p>
          <p className="font-semibold text-gray-700 text-lg">No tags yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">Create tags to organize your transactions</p>
          <button onClick={openAdd} className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}>
            Create First Tag
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map(tag => {
            const stats = getTagStats(tag.id)
            return (
              <div key={tag.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ background: tag.color }} />
                    <span
                      className="px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm"
                      style={{ background: tag.color }}
                    >
                      #{tag.name}
                    </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(tag)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100">
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => setDeleteConfirm(tag.id)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Transactions</span>
                    <span className="font-bold text-gray-800">{stats.count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Amount</span>
                    <span className="font-bold text-gray-800">{formatCurrency(stats.totalAmount)}</span>
                  </div>
                </div>

                {stats.count > 0 && (
                  <button
                    onClick={() => setPage('transactions')}
                    className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border-2 border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600 transition-colors"
                  >
                    View Transactions <ArrowRight size={12} />
                  </button>
                )}
              </div>
            )
          })}

          {/* Add new */}
          <button
            onClick={openAdd}
            className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 p-5 hover:border-orange-300 hover:bg-orange-50 transition-all flex flex-col items-center justify-center gap-2 min-h-[160px] group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
              <Plus size={18} className="text-gray-400 group-hover:text-orange-500" />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-orange-500 transition-colors">Add Tag</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTag ? 'Edit Tag' : 'New Tag'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4 pb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tag Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. zaruri, emi, luxury"
              maxLength={20}
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 ${errors.name ? 'border-red-400' : 'border-gray-200 focus:border-orange-400'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Preview */}
          {form.name && (
            <div className="flex justify-center">
              <span className="px-4 py-2 rounded-full text-white font-bold text-sm shadow-sm" style={{ background: form.color }}>
                #{form.name}
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Color</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color }))}
                  className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${form.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
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
            {editTag ? 'Update Tag' : 'Create Tag'}
          </button>
        </form>
      </Modal>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-scale-in">
            <p className="text-4xl text-center mb-3">🏷️</p>
            <h3 className="font-bold text-gray-900 text-center text-lg mb-2">Delete Tag?</h3>
            <p className="text-gray-500 text-sm text-center mb-1">
              This tag will be removed from all {getTagStats(deleteConfirm).count} transaction(s).
            </p>
            <p className="text-gray-500 text-sm text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 rounded-xl text-white font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
