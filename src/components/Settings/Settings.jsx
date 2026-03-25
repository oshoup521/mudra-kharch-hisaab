import React, { useState } from 'react'
import { Save, Trash2, LogOut, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Settings() {
  const { settings, updateSettings, syncStatus, syncError, clearAllData } = useApp()
  const { user, signOut } = useAuth()
  const [form, setForm] = useState({ ...settings })
  const [saved, setSaved] = useState(false)
  const [clearConfirm, setClearConfirm] = useState(false)

  const handleSave = () => {
    updateSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClearData = async () => {
    await clearAllData()
    setClearConfirm(false)
  }

  const syncLabel = {
    idle: 'Connected',
    syncing: 'Syncing…',
    synced: 'All changes saved',
    error: 'Sync error',
  }[syncStatus] ?? 'Connected'

  const syncBadgeClass = {
    idle: 'bg-emerald-100 text-emerald-700',
    syncing: 'bg-orange-100 text-orange-700',
    synced: 'bg-emerald-100 text-emerald-700',
    error: 'bg-red-100 text-red-700',
  }[syncStatus] ?? 'bg-emerald-100 text-emerald-700'

  return (
    <div className="p-4 sm:p-6 space-y-5 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 text-sm">Personalize your Mudra experience</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Rahul"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Currency</label>
            <select
              value={form.currency}
              onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400"
            >
              <option value="₹">₹ Indian Rupee (INR)</option>
              <option value="$">$ US Dollar (USD)</option>
              <option value="€">€ Euro (EUR)</option>
              <option value="£">£ British Pound (GBP)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cloud Sync */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Cloud Sync</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              {syncStatus === 'error' ? (
                <CloudOff size={18} className="text-red-500" />
              ) : (
                <Cloud size={18} className={syncStatus === 'syncing' ? 'text-orange-500 animate-pulse' : 'text-emerald-500'} />
              )}
              <div>
                <p className="font-semibold text-gray-800 text-sm">Supabase</p>
                <p className="text-gray-400 text-xs">{user?.email}</p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${syncBadgeClass}`}>
              {syncLabel}
            </span>
          </div>

          {syncError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-red-700 text-xs font-semibold mb-0.5">Sync Error</p>
              <p className="text-red-500 text-xs font-mono break-all">{syncError}</p>
            </div>
          )}

          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors text-left"
          >
            <LogOut size={16} className="text-gray-500" />
            <div>
              <p className="font-semibold text-gray-700 text-sm">Sign Out</p>
              <p className="text-gray-400 text-xs">Your data stays saved locally</p>
            </div>
          </button>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">About Mudra</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md" style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}>
            🪷
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">Mudra मुद्रा</p>
            <p className="text-gray-500 text-sm">Smart Indian Expense Tracker</p>
            <p className="text-gray-400 text-xs mt-0.5">Version 1.0.0</p>
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
          <p className="text-orange-800 text-sm font-medium">
            Made with ❤️ for India. Track your ₹₹₹ the smart way!
          </p>
          <p className="text-orange-600 text-xs mt-1">
            Data is stored locally and synced to Supabase cloud.
          </p>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4">Data Management</h3>
        <div className="space-y-3">
          <button
            onClick={() => setClearConfirm(true)}
            className="w-full flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100 hover:bg-red-100 transition-colors text-left"
          >
            <Trash2 size={16} className="text-red-500" />
            <div>
              <p className="font-semibold text-red-700 text-sm">Clear All Data</p>
              <p className="text-red-400 text-xs">Reset local data (does not delete cloud data)</p>
            </div>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`w-full py-3 rounded-xl text-white font-bold shadow-lg transition-all ${saved ? 'bg-emerald-500' : ''}`}
        style={!saved ? { background: 'linear-gradient(135deg, #F97316, #EA580C)' } : {}}
      >
        <Save size={16} className="inline mr-2" />
        {saved ? '✓ Settings Saved!' : 'Save Settings'}
      </button>

      {/* Clear confirm */}
      {clearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setClearConfirm(false)} />
          <div className="relative bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full animate-scale-in">
            <p className="text-4xl text-center mb-3">⚠️</p>
            <h3 className="font-bold text-gray-900 text-center text-lg mb-2">Clear Local Data?</h3>
            <p className="text-gray-500 text-sm text-center mb-5">
              This resets the app locally. Your cloud data in Supabase is unaffected and will re-sync on next load.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setClearConfirm(false)} className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold">Cancel</button>
              <button onClick={handleClearData} className="flex-1 py-2.5 bg-red-500 rounded-xl text-white font-semibold">Clear Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
