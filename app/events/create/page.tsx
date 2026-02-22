import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EventForm from '@/components/EventForm'
import Card from '@/components/ui/Card'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Screening',
  description: 'Host a screening event for your independent film.',
}

export default async function CreateEventPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/events/create')
  }

  // Fetch profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'creator') {
    return (
      <div className="min-h-screen py-10 px-6">
        <div className="max-w-2xl mx-auto">
          <Card variant="dark" className="text-center py-12">
            <h1 className="font-display text-2xl font-bold text-text-primary mb-4">
              Creator Access Required
            </h1>
            <p className="text-text-secondary mb-6">
              Switch to the Creator role in your profile to create screening events.
            </p>
            <Link href="/profile">
              <Button>Go to Profile Settings</Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-2">
          Create a Screening
        </h1>
        <p className="text-text-secondary mb-8">
          Share your film with an audience. Fill out the details below.
        </p>

        <Card variant="dark">
          <EventForm />
        </Card>
      </div>
    </div>
  )
}
