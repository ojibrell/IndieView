'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { GENRES } from '@/lib/constants'

export default function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [genre, setGenre] = useState(searchParams.get('genre') || '')
  const [freeOnly, setFreeOnly] = useState(searchParams.get('free') === 'true')
  const [thisWeekend, setThisWeekend] = useState(searchParams.get('weekend') === 'true')

  const updateFilters = useCallback(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (genre) params.set('genre', genre)
    if (freeOnly) params.set('free', 'true')
    if (thisWeekend) params.set('weekend', 'true')

    const queryString = params.toString()
    router.push(`/events${queryString ? `?${queryString}` : ''}`)
  }, [search, genre, freeOnly, thisWeekend, router])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(updateFilters, 300)
    return () => clearTimeout(timer)
  }, [updateFilters])

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
        <input
          type="text"
          placeholder="Search by title or city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-bg-secondary border border-border-subtle text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-amber/50 text-sm"
        />
      </div>

      {/* Genre filter */}
      <select
        value={genre}
        onChange={(e) => setGenre(e.target.value)}
        className="px-4 py-3 rounded-lg bg-bg-secondary border border-border-subtle text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-amber/50 appearance-none min-w-[140px]"
      >
        <option value="">All Genres</option>
        {GENRES.map((g) => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>

      {/* Free toggle */}
      <label className="flex items-center gap-2 px-4 py-3 rounded-lg bg-bg-secondary border border-border-subtle cursor-pointer text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap">
        <input
          type="checkbox"
          checked={freeOnly}
          onChange={(e) => setFreeOnly(e.target.checked)}
          className="rounded accent-amber"
        />
        Free Only
      </label>

      {/* This Weekend */}
      <label className="flex items-center gap-2 px-4 py-3 rounded-lg bg-bg-secondary border border-border-subtle cursor-pointer text-sm text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap">
        <input
          type="checkbox"
          checked={thisWeekend}
          onChange={(e) => setThisWeekend(e.target.checked)}
          className="rounded accent-amber"
        />
        This Weekend
      </label>
    </div>
  )
}
