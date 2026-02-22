import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/HeroSection'
import EventCard from '@/components/EventCard'
import EmptyState from '@/components/EmptyState'
import { Film, Search, Ticket } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import type { Event } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'upcoming')
    .order('event_date', { ascending: true })
    .limit(6)

  const upcomingEvents = (events || []) as Event[]

  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Events Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-10 text-center">
            Upcoming Screenings
          </h2>

          {upcomingEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link href="/events">
                  <Button variant="outline">View All Events &rarr;</Button>
                </Link>
              </div>
            </>
          ) : (
            <EmptyState
              title="No upcoming screenings yet"
              description="Be the first to create a screening event and share your film with the world."
              actionLabel="Host a Screening"
              actionHref="/events/create"
            />
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-6 bg-bg-secondary">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-14 text-center">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <Film className="w-8 h-8 text-amber" />,
                title: 'Create',
                description: 'Filmmakers post their screening events with all the details — date, location, capacity.',
              },
              {
                icon: <Search className="w-8 h-8 text-amber" />,
                title: 'Discover',
                description: 'Film lovers browse and find screenings happening in their city.',
              },
              {
                icon: <Ticket className="w-8 h-8 text-amber" />,
                title: 'Attend',
                description: 'Reserve your seat and experience indie cinema live, in person.',
              },
            ].map((step) => (
              <div key={step.title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-5">
                  {step.icon}
                </div>
                <h3 className="font-display text-xl font-semibold text-text-primary mb-3">
                  {step.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Ready to host your screening?
          </h2>
          <p className="text-text-secondary mb-8">
            Share your film with an audience that&apos;s ready to discover something new.
          </p>
          <Link href="/events/create">
            <Button size="lg">Create Event</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
