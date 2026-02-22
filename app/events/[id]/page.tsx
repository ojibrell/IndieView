import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Users, ExternalLink, Share2, Film, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import RSVPButton from '@/components/RSVPButton'
import Badge from '@/components/ui/Badge'
import Card from '@/components/ui/Card'
import { formatEventDateFull, getSeatsRemaining, isEventPast } from '@/lib/utils'
import type { Event, Profile } from '@/lib/types'
import type { Metadata } from 'next'

interface EventPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, film_title, description, poster_url')
    .eq('id', id)
    .single()

  if (!event) return { title: 'Event Not Found' }

  return {
    title: event.film_title,
    description: event.description || `${event.title} — a screening of ${event.film_title}`,
    openGraph: {
      images: event.poster_url ? [event.poster_url] : [],
    },
  }
}

function ShareButton({ eventId }: { eventId: string }) {
  return (
    <button
      onClick={() => {
        if (typeof window !== 'undefined') {
          navigator.clipboard.writeText(window.location.href)
        }
      }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-elevated text-text-secondary hover:text-text-primary transition-colors text-sm"
    >
      <Share2 className="w-4 h-4" />
      Share
    </button>
  )
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch event with creator profile
  const { data: event } = await supabase
    .from('events')
    .select('*, creator:profiles!creator_id(*)')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const typedEvent = event as Event & { creator: Profile }

  // Check auth + RSVP status
  const { data: { user } } = await supabase.auth.getUser()
  let rsvpStatus: 'none' | 'confirmed' = 'none'

  if (user) {
    const { data: rsvp } = await supabase
      .from('rsvps')
      .select('status')
      .eq('event_id', id)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .single()

    if (rsvp) rsvpStatus = 'confirmed'
  }

  const seatsRemaining = getSeatsRemaining(typedEvent.max_capacity, typedEvent.current_attendees)
  const isFull = seatsRemaining === 0
  const isPast = isEventPast(typedEvent.event_date) || typedEvent.status === 'past'
  const capacityPercentage = Math.round((typedEvent.current_attendees / typedEvent.max_capacity) * 100)

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Poster — left column */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-xl shadow-stone-900/30 bg-bg-card-dark">
                {typedEvent.poster_url ? (
                  <Image
                    src={typedEvent.poster_url}
                    alt={typedEvent.film_title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber/20 to-terracotta/20 flex items-center justify-center">
                    <Film className="w-20 h-20 text-text-secondary" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Details — right column */}
          <div className="lg:col-span-3 space-y-8">
            {/* Title & badges */}
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-2">
                {typedEvent.film_title}
              </h1>
              {typedEvent.title !== typedEvent.film_title && (
                <p className="text-lg text-text-secondary mb-4">{typedEvent.title}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {typedEvent.genre && <Badge variant="genre">{typedEvent.genre}</Badge>}
                {typedEvent.ticket_type === 'free' && <Badge variant="free">Free</Badge>}
                {isPast && <Badge variant="past">Past Event</Badge>}
                {isFull && !isPast && <Badge variant="sold_out">Sold Out</Badge>}
              </div>
            </div>

            {/* Description */}
            {typedEvent.description && (
              <div>
                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {typedEvent.description}
                </p>
              </div>
            )}

            {/* Info cards */}
            <div className="space-y-4">
              {/* Date */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-bg-secondary">
                <Calendar className="w-5 h-5 text-amber mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-text-primary">
                    {formatEventDateFull(typedEvent.event_date)}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-bg-secondary">
                <MapPin className="w-5 h-5 text-amber mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-text-primary">{typedEvent.location_name}</p>
                  <p className="text-sm text-text-secondary">
                    {typedEvent.location_address}, {typedEvent.location_city}
                  </p>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-bg-secondary">
                <Users className="w-5 h-5 text-amber mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-text-primary">
                    {typedEvent.current_attendees} of {typedEvent.max_capacity} seats taken
                  </p>
                  <div className="mt-2 w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Trailer */}
            {typedEvent.trailer_url && (
              <a
                href={typedEvent.trailer_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-amber hover:text-amber-light transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Watch Trailer
              </a>
            )}

            {/* Creator card */}
            {typedEvent.creator && (
              <Card variant="dark" className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-amber" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Hosted by</p>
                  <p className="font-medium text-text-primary">
                    {typedEvent.creator.display_name || typedEvent.creator.full_name || 'A filmmaker'}
                  </p>
                </div>
              </Card>
            )}

            {/* RSVP & Share */}
            <div className="space-y-4">
              <RSVPButton
                eventId={typedEvent.id}
                initialRsvpStatus={rsvpStatus}
                isFull={isFull}
                isPast={isPast}
                isLoggedIn={!!user}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
