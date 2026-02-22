'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import { ROLES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

interface ProfileFormProps {
  profile: Profile
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(profile.display_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [city, setCity] = useState(profile.city || '')
  const [role, setRole] = useState(profile.role)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
          city: city.trim() || null,
          role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (updateError) throw updateError

      setSuccess(true)
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-terracotta/10 border border-terracotta/30 text-sm text-terracotta">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-sage/10 border border-sage/30 text-sm text-sage">
          Profile updated successfully!
        </div>
      )}

      <Input
        label="Display Name"
        value={displayName}
        onChange={(e) => { setDisplayName(e.target.value); setSuccess(false) }}
        placeholder="How you want to be known"
      />

      <Textarea
        label="Bio"
        value={bio}
        onChange={(e) => { setBio(e.target.value); setSuccess(false) }}
        placeholder="Tell people about yourself..."
      />

      <Input
        label="City"
        value={city}
        onChange={(e) => { setCity(e.target.value); setSuccess(false) }}
        placeholder="Where are you based?"
      />

      <Select
        label="Role"
        value={role}
        onChange={(e) => { setRole(e.target.value as 'creator' | 'attendee'); setSuccess(false) }}
        options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
      />

      <Button type="submit" isLoading={isLoading}>
        Save Changes
      </Button>
    </form>
  )
}
