'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Menu } from './Menu'
import { FavIcon } from './Icons'
import SearchCommand from './SearchCommand'

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header
        className="sticky top-0 w-full h-14 flex items-center px-3 bg-primary/75 backdrop-blur-xl border-b border-[#1a1c2e] z-50"
        aria-label="Main Header"
      >
        <div className="w-full max-w-360 mx-auto flex justify-center lg:justify-between gap-4 relative">
          {/* Logo */}
          <Link className="flex items-center gap-1.5 shrink-0" href="/" aria-label="Home - CS2 Skins DB">
            <FavIcon className="w-6 h-6" />
            <span className="text-2xl font-mono font-bold leading-none bg-linear-to-r from-violet-400 to-violet-600 bg-clip-text text-transparent">
              CS2 Skins DB
            </span>
          </Link>

          {/* Right: mobile search icon */}
          <button
            onClick={() => setSearchOpen(true)}
            className="lg:hidden p-2 text-accent-foreground hover:text-foreground transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <Menu />

          {/* Desktop: centered search trigger */}
          <div className="hidden lg:flex justify-center">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 w-80 h-9 px-3 rounded-lg bg-muted border border-[#262a42] text-accent-foreground text-sm hover:bg-accent transition-colors cursor-pointer"
              aria-label="Open search"
            >
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 text-left">Search skins, cases, agents...</span>
              <kbd className="inline-flex items-center gap-0.5 rounded border border-[#262a42] px-1.5 py-0.5 text-xs font-mono text-accent-foreground/80">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
