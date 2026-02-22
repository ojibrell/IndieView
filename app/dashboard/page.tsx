import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Calendar, Users, Film } from 'lucide-react'
import Card from '@/components/ui/Card'
import DashboardTabs from '@/components/DashboardTabs'
import type { Event, RSVP, Profile } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your events and RSVPs.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/dashboard')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const typedProfile = profile as Profile | null
  const isCreator = typedProfile?.role === 'creator'

  // Fetch user's events (if creator)
  let myEvents: Event[] = []
  if (isCreator) {
    const { data: events } = await supabase
      .from('events')
      .select('*')
      .eq('creator_id', user.id)
      .order('event_date', { ascending: false })

    myEvents = (events || []) as Event[]
  }

  // Fetch user's RSVPs with event data
  const { data: rsvps } = await supabase
    .from('rsvps')
    .select('*, event:events(*)')
    .eq('user_id', user.id)
    .eq('status', 'confirmed')

  const myRsvps = (rsvps || []) as RSVP[]

  // Stats for creator
  const totalEvents = myEvents.length
  const totalAttendees = myEvents.reduce((sum, e) => sum + e.current_attendees, 0)
  const upcomingCount = myEvents.filter((e) => e.status === 'upcoming').length

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-8">
          Dashboard
        </h1>

        {/* Creator stats */}
        {isCreator && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <Card variant="dark" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0">
                <Film className="w-6 h-6 text-amber" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{totalEvents}</p>
                <p className="text-sm text-text-secondary">Total Events</p>
              </div>
            </Card>

            <Card variant="dark" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sage/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-sage" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{totalAttendees}</p>
                <p className="text-sm text-text-secondary">Total Attendees</p>
              </div>
            </Card>

            <Card variant="dark" className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-terracotta" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text-primary">{upcomingCount}</p>
                <p className="text-sm text-text-secondary">Upcoming</p>
              </div>
            </Card>
          </div>
        )}

        <DashboardTabs myEvents={myEvents} myRsvps={myRsvps} isCreator={isCreator} />
      </div>
    </div>
  )
}
