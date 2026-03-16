import React from 'react'
import { NavLink } from 'react-router-dom'
import { ShieldAlert, Map, Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/70 backdrop-blur">
      <nav className="mx-auto max-w-7xl px-3 sm:px-6 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-brand-700" aria-hidden="true" />
          <span className="font-semibold">Urban Flood Monitor</span>
        </div>
        <div className="flex items-center gap-4">
          <NavLink to="/" className={({isActive}) =>
            `flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'font-medium' : ''}`}>
            <Map className="h-4 w-4" /> Dashboard
          </NavLink>
          <NavLink to="/settings" className={({isActive}) =>
            `flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${isActive ? 'font-medium' : ''}`}>
            <Settings className="h-4 w-4" /> Settings
          </NavLink>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
