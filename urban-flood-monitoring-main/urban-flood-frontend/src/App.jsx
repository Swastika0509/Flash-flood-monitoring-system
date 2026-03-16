import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="main" className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 md:px-8 py-4 space-y-4">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-800 py-4 text-center text-sm text-gray-500">
        Built for SDG 6 & SDG 11 • © {new Date().getFullYear()}
        <span className="sr-only">Footer</span>
      </footer>
    </div>
  )
}
