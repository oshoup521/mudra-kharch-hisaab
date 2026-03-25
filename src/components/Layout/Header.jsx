import React from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'
import { format } from 'date-fns'

const PAGE_TITLES = {
  dashboard:    'Dashboard',
  transactions: 'Transactions',
  analysis:     'Analysis',
  categories:   'Categories',
  budget:       'Budget',
  scheduled:    'Scheduled',
  tags:         'Tags',
  ledger:       'Udhaari Tracker',
  settings:     'Settings',
}

export default function Header({ onAddTransaction }) {
  const { activePage, settings } = useApp()
  const today = new Date()

  return (
    <header
      className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
        {/* Title + date */}
        <div>
          <h2 className="font-bold text-gray-900 text-base sm:text-lg leading-none">
            {PAGE_TITLES[activePage] || 'Mudra'}
          </h2>
          <p className="text-gray-400 text-[11px] sm:text-xs mt-0.5">
            {format(today, 'EEE, d MMM yyyy')}
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Add button — visible on sm+ only; mobile uses bottom nav FAB */}
          <button
            onClick={onAddTransaction}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-lg shadow-orange-200 transition-all hover:shadow-orange-300 hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
          >
            <Plus size={15} />
            Add
          </button>

          {/* Avatar */}
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
          >
            {settings.name?.charAt(0).toUpperCase() || 'R'}
          </div>
          <span className="hidden sm:block text-sm font-semibold text-gray-700">
            {settings.name || 'Rahul'}
          </span>
        </div>
      </div>
    </header>
  )
}
