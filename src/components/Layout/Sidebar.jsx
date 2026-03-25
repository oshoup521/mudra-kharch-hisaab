import React from 'react'
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, Tag, PiggyBank,
  CalendarClock, Tags, BookOpen, Settings,
} from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

const navItems = [
  { id: 'dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'analysis',    label: 'Analysis',     icon: BarChart3 },
  { id: 'categories',  label: 'Categories',   icon: Tag },
  { id: 'budget',      label: 'Budget',       icon: PiggyBank },
  { id: 'scheduled',   label: 'Scheduled',    icon: CalendarClock },
  { id: 'tags',        label: 'Tags',         icon: Tags },
  { id: 'ledger',      label: 'Udhaari',      icon: BookOpen },
]

export default function Sidebar() {
  const { activePage, setPage } = useApp()

  return (
    <aside
      className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0 shadow-2xl sidebar-scroll overflow-y-auto"
      style={{ background: '#1E1B4B' }}
    >
      {/* Logo */}
      <div
        className="flex-shrink-0 px-4 py-6"
        style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #3730A3 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shadow-lg"
            style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}
          >
            🪷
          </div>
          <div>
            <h1 className="text-white font-bold text-xl leading-none">Mudra</h1>
            <p className="text-indigo-300 text-xs mt-0.5 font-medium">मुद्रा</p>
          </div>
        </div>
        <p className="text-indigo-300/60 text-xs mt-4 font-medium">Smart Expense Tracker</p>
      </div>

      <div className="mx-4 border-t border-white/10" />

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id
          return (
            <button
              key={id}
              onClick={() => setPage(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
                isActive ? 'text-white shadow-lg' : 'text-indigo-300 hover:text-white hover:bg-white/10'
              }`}
              style={isActive ? { background: 'linear-gradient(135deg, #F97316, #EA580C)' } : {}}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-indigo-400 group-hover:text-white'} />
              <span className="font-medium text-sm">{label}</span>
              {id === 'ledger' && (
                <span className="ml-auto text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full">उधारी</span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="mx-4 border-t border-white/10" />

      {/* Settings */}
      <div className="px-3 py-4">
        <button
          onClick={() => setPage('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group ${
            activePage === 'settings' ? 'text-white' : 'text-indigo-300 hover:text-white hover:bg-white/10'
          }`}
          style={activePage === 'settings' ? { background: 'linear-gradient(135deg, #F97316, #EA580C)' } : {}}
        >
          <Settings size={18} className="text-indigo-400 group-hover:text-white" />
          <span className="font-medium text-sm">Settings</span>
        </button>
      </div>
    </aside>
  )
}
