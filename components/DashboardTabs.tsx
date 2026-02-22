'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Users, ExternalLink, Trash2 } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/EmptyState'
import { cn, formatEventDate } from '@/lib/utils'
import type { Event, RSVP } from '@/lib/types'

interface DashboardTabsProps {
  myEvents: Event[]
  myRsvps: RSVP[]
  isCreator: boolean
}

export default function DashboardTabs({ myEvents, myRsvps, isCreator }: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'rsvps'>(isCreator ? 'events' : 'rsvps')
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDeleteEvent = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const res = await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: deleteTarget.id }),
      })
      if (res.ok) {
        setDeleteTarget(null)
        router.refresh()
      }
    } catch {
      // Silently fail
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelRsvp = async (eventId: string) => {
    try {
      const res = await fetch('/api/rsvp', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      // Silently fail
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="status">Upcoming</Badge>
      case 'sold_out':
        return <Badge variant="sold_out">Sold Out</Badge>
      case 'past':
        return <Badge variant="past">Past</Badge>
      case 'cancelled':
        return <Badge variant="sold_out">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-border-subtle mb-8">
        {isCreator && (
          <button
            onClick={() => setActiveTab('events')}
            className={cn(
              'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
              activeTab === 'events'
                ? 'border-amber text-amber'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            )}
          >
            My Events
          </button>
        )}
        <button
          onClick={() => setActiveTab('rsvps')}
          className={cn(
            'px-6 py-3 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'rsvps'
              ? 'border-amber text-amber'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          )}
        >
          My RSVPs
        </button>
      </div>

      {/* My Events */}
      {activeTab === 'events' && (
        <div>
          {myEvents.length === 0 ? (
            <EmptyState
              title="No events yet"
              description="Create your first screening and share it with the world."
              actionLabel="Create Your First Screening"
              actionHref="/events/create"
            />
          ) : (
            <div className="space-y-4">
              {myEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-bg-card-dark rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:bg-bg-elevated"
                >
                  <div className="flex-1 min-w-0">
                    <Link href={`/events/${event.id}`} className="group">
                      <h3 className="font-display text-lg font-semibold text-text-primary group-hover:text-amber transition-colors truncate">
                        {event.film_title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatEventDate(event.event_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {event.current_attendees}/{event.max_capacity} seats
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(event.status)}
                    <Link href={`/events/${event.id}`}>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(event)}
                      className="text-terracotta hover:text-terracotta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Event"
      >
        <p className="text-text-secondary mb-6">
          Are you sure you want to delete <span className="font-semibold text-text-primary">{deleteTarget?.film_title}</span>? This will also remove all RSVPs. This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleDeleteEvent} isLoading={isDeleting}>
            Delete
          </Button>
        </div>
      </Modal>

      {/* My RSVPs */}
      {activeTab === 'rsvps' && (
        <div>
          {myRsvps.length === 0 ? (
            <EmptyState
              title="No RSVPs yet"
              description="Browse upcoming screenings and reserve your seat."
              actionLabel="Browse Screenings"
              actionHref="/events"
            />
          ) : (
            <div className="space-y-4">
              {myRsvps.map((rsvp) => {
                const event = rsvp.event
                if (!event) return null

                const isPast = event.status === 'past'

                return (
                  <div
                    key={rsvp.id}
                    className="bg-bg-card-dark rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all hover:bg-bg-elevated"
                  >
                    <div className="flex-1 min-w-0">
                      <Link href={`/events/${event.id}`} className="group">
                        <h3 className="font-display text-lg font-semibold text-text-primary group-hover:text-amber transition-colors truncate">
                          {event.film_title}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatEventDate(event.event_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.location_name}, {event.location_city}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(event.status)}
                      {!isPast && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelRsvp(event.id)}
                          className="text-terracotta hover:text-terracotta"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
