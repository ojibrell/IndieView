import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import EventCard from '@/components/EventCard'
import EventFilters from '@/components/EventFilters'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import EmptyState from '@/components/EmptyState'
import { getWeekendRange } from '@/lib/utils'
import type { Event } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Screenings',
  description: 'Discover indie film screenings happening near you.',
}

interface BrowsePageProps {
  searchParams: Promise<{
    search?: string
    genre?: string
    free?: string
    weekend?: string
  }>
}

async function EventGrid({ searchParams }: { searchParams: Awaited<BrowsePageProps['searchParams']> }) {
  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select('*')
    .in('status', ['upcoming', 'sold_out'])
    .order('event_date', { ascending: true })
    .limit(24)

  if (searchParams.search) {
    const search = `%${searchParams.search}%`
    query = query.or(`film_title.ilike.${search},location_city.ilike.${search},title.ilike.${search}`)
  }

  if (searchParams.genre) {
    query = query.eq('genre', searchParams.genre)
  }

  if (searchParams.free === 'true') {
    query = query.eq('ticket_type', 'free')
  }

  if (searchParams.weekend === 'true') {
    const { friday, sunday } = getWeekendRange()
    query = query.gte('event_date', friday).lte('event_date', sunday)
  }

  const { data: events } = await query
  const eventList = (events || []) as Event[]

  if (eventList.length === 0) {
    return (
      <EmptyState
        title="No screenings found"
        description="Try adjusting your filters or check back later for new events."
        actionLabel="Clear Filters"
        actionHref="/events"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {eventList.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}

export default async function BrowseEventsPage({ searchParams }: BrowsePageProps) {
  const resolvedParams = await searchParams

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-8">
          Browse Screenings
        </h1>

        <Suspense fallback={null}>
          <EventFilters />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton count={6} />}>
          <EventGrid searchParams={resolvedParams} />
        </Suspense>
      </div>
    </div>
  )
}
