import React from 'react'

export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7c9af2] border-t-transparent"></div>
        <p className="text-sm text-white/80">{message}</p>
      </div>
    </div>
  )
}

export function ActionLoader({ size = 'small' }) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-5 w-5',
    large: 'h-6 w-6'
  }
  
  return (
    <div className={`animate-spin rounded-full border border-current border-t-transparent ${sizeClasses[size]}`}></div>
  )
}
