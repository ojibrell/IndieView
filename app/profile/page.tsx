import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'
import Card from '@/components/ui/Card'
import type { Profile } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Profile',
  description: 'Edit your IndieView profile.',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/profile')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen py-10 px-6">
      <div className="max-w-xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-2">
          Your Profile
        </h1>
        <p className="text-text-secondary mb-8">
          Update your display name, bio, and preferences.
        </p>

        <Card variant="dark">
          <ProfileForm profile={profile as Profile} />
        </Card>
      </div>
    </div>
  )
}
