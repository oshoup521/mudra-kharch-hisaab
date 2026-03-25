import React, { useState } from 'react'
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, Plus,
  MoreHorizontal, PiggyBank, Tag, CalendarClock, Tags, BookOpen, Settings,
} from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

const PRIMARY_TABS = [
  { id: 'dashboard',    label: 'Home',    icon: LayoutDashboard },
  { id: 'transactions', label: 'Txns',    icon: ArrowLeftRight },
  null, // center FAB
  { id: 'analysis',    label: 'Analysis', icon: BarChart3 },
  { id: 'more',        label: 'More',     icon: MoreHorizontal },
]

const MORE_ITEMS = [
  { id: 'budget',     label: 'Budget',     icon: PiggyBank },
  { id: 'categories', label: 'Categories', icon: Tag },
  { id: 'scheduled',  label: 'Scheduled',  icon: CalendarClock },
  { id: 'tags',       label: 'Tags',       icon: Tags },
  { id: 'ledger',     label: 'Udhaari',    icon: BookOpen },
  { id: 'settings',   label: 'Settings',   icon: Settings },
]

export default function BottomNav({ onAdd }) {
  const { activePage, setPage } = useApp()
  const [showMore, setShowMore] = useState(false)

  const isMoreActive = MORE_ITEMS.some(item => item.id === activePage)

  const handleNav = (id) => {
    setPage(id)
    setShowMore(false)
  }

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-100"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
      >
        <div className="flex items-center h-[3.75rem]">
          {PRIMARY_TABS.map((tab, i) => {
            if (tab === null) {
              return (
                <div key="fab" className="flex-1 flex justify-center">
                  <button
                    onClick={onAdd}
                    className="w-13 h-13 rounded-full flex items-center justify-center text-white shadow-xl shadow-orange-300/50 -translate-y-3 transition-transform active:scale-90"
                    style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
                  >
                    <Plus size={24} strokeWidth={2.5} />
                  </button>
                </div>
              )
            }

            const isActive = tab.id === 'more'
              ? (isMoreActive || showMore)
              : activePage === tab.id
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                onClick={() => tab.id === 'more' ? setShowMore(s => !s) : handleNav(tab.id)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full"
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-orange-500' : 'text-gray-400'}
                />
                <span className={`text-[9.5px] font-semibold tracking-tight ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* More Bottom Sheet */}
      {showMore && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          />

          {/* Sheet */}
          <div
            className="relative w-full bg-white rounded-t-[28px] shadow-2xl animate-slide-up-sheet"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-4">
              <div className="w-9 h-1 bg-gray-200 rounded-full" />
            </div>

            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-5 mb-3">More</p>

            <div className="grid grid-cols-3 gap-2.5 px-4 pb-2">
              {MORE_ITEMS.map(({ id, label, icon: Icon }) => {
                const isActive = activePage === id
                return (
                  <button
                    key={id}
                    onClick={() => handleNav(id)}
                    className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all active:scale-95 ${
                      isActive ? 'bg-orange-50' : 'bg-gray-50'
                    }`}
                  >
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={isActive ? 'text-orange-500' : 'text-gray-500'}
                    />
                    <span className={`text-xs font-semibold ${isActive ? 'text-orange-500' : 'text-gray-600'}`}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
