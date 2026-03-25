import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react'
import { DEFAULT_CATEGORIES, DEFAULT_TAGS, SAMPLE_TRANSACTIONS } from '../utils/constants.js'
import { generateId } from '../utils/helpers.js'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './AuthContext.jsx'

const AppContext = createContext(null)

const now = new Date()
const thisYear = now.getFullYear()
const thisMonth = now.getMonth()

const INITIAL_STATE = {
  transactions: SAMPLE_TRANSACTIONS,
  categories: DEFAULT_CATEGORIES,
  budgets: {
    overall: 80000,
    categories: {
      food: 10000,
      transport: 5000,
      shopping: 8000,
      entertainment: 3000,
      housing: 20000,
      health: 5000,
      bills: 3000,
      mobile: 1500,
    },
  },
  scheduled: [
    {
      id: 'sch_001',
      name: 'House Rent',
      amount: 18500,
      type: 'expense',
      categoryId: 'housing',
      frequency: 'monthly',
      startDate: new Date(thisYear, 0, 1).toISOString(),
      endDate: null,
      nextDue: new Date(thisYear, thisMonth + 1, 1).toISOString(),
      note: 'Monthly house rent',
      active: true,
      tags: ['fixed', 'zaruri'],
    },
    {
      id: 'sch_002',
      name: 'SIP - Mutual Fund',
      amount: 15000,
      type: 'expense',
      categoryId: 'investment',
      frequency: 'monthly',
      startDate: new Date(thisYear, 0, 12).toISOString(),
      endDate: null,
      nextDue: new Date(thisYear, thisMonth + 1, 12).toISOString(),
      note: 'Zerodha Coin SIP',
      active: true,
      tags: ['fixed'],
    },
    {
      id: 'sch_003',
      name: 'Netflix Subscription',
      amount: 649,
      type: 'expense',
      categoryId: 'entertainment',
      frequency: 'monthly',
      startDate: new Date(thisYear, 0, 5).toISOString(),
      endDate: null,
      nextDue: new Date(thisYear, thisMonth, 5).toISOString(),
      note: 'Netflix premium plan',
      active: true,
      tags: ['luxury'],
    },
  ],
  ledger: [
    {
      id: 'led_001',
      personName: 'Amit Sharma',
      amount: 5000,
      type: 'lent',
      date: new Date(thisYear, thisMonth - 1, 10).toISOString(),
      dueDate: new Date(thisYear, thisMonth + 1, 10).toISOString(),
      note: 'Lent for laptop repair',
      status: 'pending',
      settlements: [],
    },
    {
      id: 'led_002',
      personName: 'Priya Singh',
      amount: 2500,
      type: 'lent',
      date: new Date(thisYear, thisMonth, 5).toISOString(),
      dueDate: new Date(thisYear, thisMonth, 25).toISOString(),
      note: 'Split for dinner at Taj',
      status: 'pending',
      settlements: [],
    },
    {
      id: 'led_003',
      personName: 'Ravi Kumar',
      amount: 8000,
      type: 'borrowed',
      date: new Date(thisYear, thisMonth - 1, 20).toISOString(),
      dueDate: new Date(thisYear, thisMonth + 1, 20).toISOString(),
      note: 'Emergency medical expense',
      status: 'partial',
      settlements: [
        { id: 'set_001', amount: 3000, date: new Date(thisYear, thisMonth, 1).toISOString(), note: 'Partial payment' },
      ],
    },
    {
      id: 'led_004',
      personName: 'Neha Gupta',
      amount: 1200,
      type: 'borrowed',
      date: new Date(thisYear, thisMonth, 8).toISOString(),
      dueDate: null,
      note: 'Lunch at office',
      status: 'settled',
      settlements: [
        { id: 'set_002', amount: 1200, date: new Date(thisYear, thisMonth, 10).toISOString(), note: 'Full payment via UPI' },
      ],
    },
  ],
  tags: DEFAULT_TAGS,
  settings: {
    currency: '₹',
    name: 'Rahul',
    theme: 'light',
  },
  activePage: 'dashboard',
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('mudra_state')
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...INITIAL_STATE,
        ...parsed,
        activePage: 'dashboard',
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_STATE
}

function reducer(state, action) {
  switch (action.type) {
    // Transactions
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] }
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t),
      }
    case 'DELETE_TRANSACTION':
      return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) }

    // Categories
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] }
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c),
      }
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) }

    // Budgets
    case 'SET_BUDGET':
      return { ...state, budgets: action.payload }

    // Scheduled
    case 'ADD_SCHEDULED':
      return { ...state, scheduled: [action.payload, ...state.scheduled] }
    case 'UPDATE_SCHEDULED':
      return {
        ...state,
        scheduled: state.scheduled.map(s => s.id === action.payload.id ? action.payload : s),
      }
    case 'DELETE_SCHEDULED':
      return { ...state, scheduled: state.scheduled.filter(s => s.id !== action.payload) }

    // Ledger
    case 'ADD_LEDGER_ENTRY':
      return { ...state, ledger: [action.payload, ...state.ledger] }
    case 'UPDATE_LEDGER_ENTRY':
      return {
        ...state,
        ledger: state.ledger.map(l => l.id === action.payload.id ? action.payload : l),
      }
    case 'DELETE_LEDGER_ENTRY':
      return { ...state, ledger: state.ledger.filter(l => l.id !== action.payload) }

    // Tags
    case 'ADD_TAG':
      return { ...state, tags: [...state.tags, action.payload] }
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(t => t.id === action.payload.id ? action.payload : t),
      }
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(t => t.id !== action.payload),
        transactions: state.transactions.map(txn => ({
          ...txn,
          tags: txn.tags?.filter(tag => tag !== action.payload) || [],
        })),
      }

    // Settings
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    // Navigation
    case 'SET_PAGE':
      return { ...state, activePage: action.payload }

    // Cloud sync: replace entire state with cloud data
    case 'LOAD_STATE':
      return {
        ...INITIAL_STATE,
        ...action.payload,
        activePage: 'dashboard',
      }

    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadFromStorage)
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle' | 'syncing' | 'synced' | 'error'
  const [syncError, setSyncError] = useState('')
  const isInitialCloudLoad = useRef(false)

  // Persist to localStorage on every change (exclude activePage)
  useEffect(() => {
    const { activePage, ...persistState } = state
    localStorage.setItem('mudra_state', JSON.stringify(persistState))
  }, [state])

  // Load cloud data when user signs in
  useEffect(() => {
    if (!user) {
      isInitialCloudLoad.current = false
      return
    }

    async function loadCloudData() {
      setSyncStatus('syncing')
      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('data')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) throw error

        if (data?.data) {
          // Cloud has data — load it (overrides local)
          dispatch({ type: 'LOAD_STATE', payload: data.data })
        } else {
          // First login — push local data to cloud
          const { activePage, ...persistState } = state
          await supabase.from('user_data').upsert({
            user_id: user.id,
            data: persistState,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
        }
        setSyncStatus('synced')
        setSyncError('')
      } catch (err) {
        console.error('[Mudra] Cloud load error:', err)
        setSyncStatus('error')
        setSyncError(err?.message || String(err))
      } finally {
        isInitialCloudLoad.current = true
      }
    }

    loadCloudData()
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced cloud save on every state change (only after initial load)
  useEffect(() => {
    if (!user || !isInitialCloudLoad.current) return

    setSyncStatus('syncing')
    const timer = setTimeout(async () => {
      try {
        const { activePage, ...persistState } = state
        const { error } = await supabase.from('user_data').upsert({
          user_id: user.id,
          data: persistState,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        if (error) throw error
        setSyncStatus('synced')
        setSyncError('')
      } catch (err) {
        console.error('[Mudra] Cloud save error:', err)
        setSyncStatus('error')
        setSyncError(err?.message || String(err))
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [state, user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Actions
  const addTransaction = (data) => dispatch({ type: 'ADD_TRANSACTION', payload: { ...data, id: generateId(), createdAt: new Date().toISOString() } })
  const updateTransaction = (data) => dispatch({ type: 'UPDATE_TRANSACTION', payload: data })
  const deleteTransaction = (id) => dispatch({ type: 'DELETE_TRANSACTION', payload: id })

  const addCategory = (data) => dispatch({ type: 'ADD_CATEGORY', payload: { ...data, id: generateId() } })
  const updateCategory = (data) => dispatch({ type: 'UPDATE_CATEGORY', payload: data })
  const deleteCategory = (id) => dispatch({ type: 'DELETE_CATEGORY', payload: id })

  const setBudget = (data) => dispatch({ type: 'SET_BUDGET', payload: data })

  const addScheduled = (data) => dispatch({ type: 'ADD_SCHEDULED', payload: { ...data, id: generateId() } })
  const updateScheduled = (data) => dispatch({ type: 'UPDATE_SCHEDULED', payload: data })
  const deleteScheduled = (id) => dispatch({ type: 'DELETE_SCHEDULED', payload: id })

  const addLedgerEntry = (data) => dispatch({ type: 'ADD_LEDGER_ENTRY', payload: { ...data, id: generateId(), settlements: [] } })
  const updateLedgerEntry = (data) => dispatch({ type: 'UPDATE_LEDGER_ENTRY', payload: data })
  const deleteLedgerEntry = (id) => dispatch({ type: 'DELETE_LEDGER_ENTRY', payload: id })

  const addTag = (data) => dispatch({ type: 'ADD_TAG', payload: { ...data, id: generateId() } })
  const updateTag = (data) => dispatch({ type: 'UPDATE_TAG', payload: data })
  const deleteTag = (id) => dispatch({ type: 'DELETE_TAG', payload: id })

  const updateSettings = (data) => dispatch({ type: 'UPDATE_SETTINGS', payload: data })
  const setPage = (page) => dispatch({ type: 'SET_PAGE', payload: page })

  const value = {
    ...state,
    syncStatus,
    syncError,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    setBudget,
    addScheduled,
    updateScheduled,
    deleteScheduled,
    addLedgerEntry,
    updateLedgerEntry,
    deleteLedgerEntry,
    addTag,
    updateTag,
    deleteTag,
    updateSettings,
    setPage,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
