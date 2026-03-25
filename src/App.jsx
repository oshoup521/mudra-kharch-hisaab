import React, { useState } from 'react'
import { useApp } from './context/AppContext.jsx'
import { useAuth } from './context/AuthContext.jsx'
import Sidebar from './components/Layout/Sidebar.jsx'
import Header from './components/Layout/Header.jsx'
import BottomNav from './components/Layout/BottomNav.jsx'
import Dashboard from './components/Dashboard/Dashboard.jsx'
import Transactions from './components/Transactions/Transactions.jsx'
import Analysis from './components/Analysis/Analysis.jsx'
import Categories from './components/Categories/Categories.jsx'
import Budget from './components/Budget/Budget.jsx'
import Scheduled from './components/Scheduled/Scheduled.jsx'
import Tags from './components/Tags/Tags.jsx'
import Ledger from './components/Ledger/Ledger.jsx'
import Settings from './components/Settings/Settings.jsx'
import AddTransactionModal from './components/Transactions/AddTransactionModal.jsx'
import LoginPage from './components/Auth/LoginPage.jsx'

const PAGE_COMPONENTS = {
  dashboard:    Dashboard,
  transactions: Transactions,
  analysis:     Analysis,
  categories:   Categories,
  budget:       Budget,
  scheduled:    Scheduled,
  tags:         Tags,
  ledger:       Ledger,
  settings:     Settings,
}

export default function App() {
  const { activePage } = useApp()
  const { user, loading } = useAuth()
  const [addModalOpen, setAddModalOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F9F7FF' }}>
        <div className="text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg mx-auto mb-3 animate-pulse"
            style={{ background: 'linear-gradient(135deg, #F97316, #EF4444)' }}
          >
            🪷
          </div>
          <p className="text-gray-400 text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return <LoginPage />

  const PageComponent = PAGE_COMPONENTS[activePage] || Dashboard

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F9F7FF' }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onAddTransaction={() => setAddModalOpen(true)} />

        {/* Scrollable content — bottom padding clears the mobile bottom nav */}
        <main className="flex-1 overflow-y-auto main-content">
          <PageComponent />
        </main>
      </div>

      {/* Mobile bottom nav (replaces hamburger + FAB) */}
      <BottomNav onAdd={() => setAddModalOpen(true)} />

      <AddTransactionModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  )
}
