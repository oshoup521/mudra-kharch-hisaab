import React, { useState, useRef, useEffect } from 'react'
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
import { RefreshCw } from 'lucide-react'

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

const PULL_THRESHOLD = 65

export default function App() {
  const { activePage, refreshFromCloud } = useApp()
  const { user, loading } = useAuth()
  const [addModalOpen, setAddModalOpen] = useState(false)
  const mainRef = useRef(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const refreshingRef = useRef(false)
  const pullDistanceRef = useRef(0)

  // Keep refs in sync with state for use inside event listeners
  useEffect(() => { refreshingRef.current = refreshing }, [refreshing])
  useEffect(() => { pullDistanceRef.current = pullDistance }, [pullDistance])

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    let startY = 0
    let active = false

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY = e.touches[0].clientY
        active = true
      }
    }

    const onTouchMove = (e) => {
      if (!active || refreshingRef.current) return
      const delta = e.touches[0].clientY - startY
      if (delta > 0) {
        // Resist overscroll with sqrt-like damping
        setPullDistance(Math.min(Math.sqrt(delta) * 5, PULL_THRESHOLD + 30))
        e.preventDefault()
      } else {
        active = false
        setPullDistance(0)
      }
    }

    const onTouchEnd = async () => {
      if (!active) return
      active = false
      const dist = pullDistanceRef.current
      setPullDistance(0)
      if (dist >= PULL_THRESHOLD && !refreshingRef.current) {
        setRefreshing(true)
        await refreshFromCloud()
        setRefreshing(false)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [refreshFromCloud])

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
        <main ref={mainRef} className="flex-1 overflow-y-auto main-content">
          {/* Pull-to-refresh indicator */}
          <div
            className="flex flex-col items-center justify-end overflow-hidden transition-[height] duration-200 ease-out"
            style={{ height: refreshing ? 52 : pullDistance > 8 ? Math.min(pullDistance * 0.75, 52) : 0 }}
          >
            <div className="pb-2">
              <RefreshCw
                size={20}
                className={`text-orange-500 transition-transform ${
                  refreshing ? 'animate-spin' : ''
                }`}
                style={{
                  transform: refreshing ? undefined : `rotate(${Math.min(pullDistance / (PULL_THRESHOLD + 30) * 360, 360)}deg)`,
                }}
              />
            </div>
          </div>
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
