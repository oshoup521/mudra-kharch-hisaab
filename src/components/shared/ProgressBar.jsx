import React from 'react'

export default function ProgressBar({ value, max, label, showPercent = true, height = 'h-2', className = '' }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const actualPercent = max > 0 ? (value / max) * 100 : 0

  const getColor = () => {
    if (actualPercent >= 100) return 'bg-red-500'
    if (actualPercent >= 75) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getTrackColor = () => {
    if (actualPercent >= 100) return 'bg-red-100'
    if (actualPercent >= 75) return 'bg-amber-100'
    return 'bg-emerald-100'
  }

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-gray-600">{label}</span>}
          {showPercent && (
            <span className={`text-xs font-semibold ${
              actualPercent >= 100 ? 'text-red-600' :
              actualPercent >= 75 ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {Math.round(actualPercent)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${getTrackColor()} rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} ${getColor()} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
