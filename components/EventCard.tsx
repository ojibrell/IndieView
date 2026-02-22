import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { Event } from '@/lib/types'
import { formatEventDate, getSeatsRemaining } from '@/lib/utils'

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const seatsRemaining = getSeatsRemaining(event.max_capacity, event.current_attendees)
  const isSoldOut = event.status === 'sold_out' || seatsRemaining === 0

  return (
    <Link href={`/events/${event.id}`}>
      <article className="group bg-bg-card rounded-2xl overflow-hidden shadow-lg shadow-stone-900/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer h-full flex flex-col">
        {/* Poster image */}
        <div className="relative aspect-video overflow-hidden bg-border-light">
          {event.poster_url ? (
            <Image
              src={event.poster_url}
              alt={event.film_title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber/20 to-terracotta/20 flex items-center justify-center">
              <span className="text-4xl">🎬</span>
            </div>
          )}
          {/* Status overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-display text-lg font-semibold">Sold Out</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <h3 className="font-display text-xl font-semibold text-text-on-light mb-2 line-clamp-2">
            {event.film_title}
          </h3>

          <div className="space-y-2 mb-4 text-sm text-text-on-light-muted">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber" />
              <span>{formatEventDate(event.event_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber" />
              <span>{event.location_city}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-auto pt-3 border-t border-border-light">
            {event.ticket_type === 'free' && <Badge variant="free">Free</Badge>}
            {event.genre && <Badge variant="genre">{event.genre}</Badge>}
            <span className="ml-auto text-xs text-text-on-light-muted">
              {isSoldOut ? 'Sold out' : `${seatsRemaining} seats left`}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
