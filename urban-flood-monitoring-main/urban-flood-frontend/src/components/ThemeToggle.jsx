import React, { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setDark(d => !d)}
      className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="hidden sm:inline">{dark ? 'Light' : 'Dark'}</span>
    </button>
  )
}
