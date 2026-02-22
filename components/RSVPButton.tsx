'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

interface RSVPButtonProps {
  eventId: string
  initialRsvpStatus: 'none' | 'confirmed'
  isFull: boolean
  isPast: boolean
  isLoggedIn: boolean
}

export default function RSVPButton({
  eventId,
  initialRsvpStatus,
  isFull,
  isPast,
  isLoggedIn,
}: RSVPButtonProps) {
  const [rsvpStatus, setRsvpStatus] = useState(initialRsvpStatus)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  if (!isLoggedIn) {
    return (
      <Link href={`/auth/login?redirect=/events/${eventId}`}>
        <Button variant="primary" size="lg" className="w-full">
          Sign in to RSVP
        </Button>
      </Link>
    )
  }

  if (isPast) {
    return (
      <Button variant="secondary" size="lg" disabled className="w-full">
        Event Has Ended
      </Button>
    )
  }

  if (isFull && rsvpStatus !== 'confirmed') {
    return (
      <Button variant="secondary" size="lg" disabled className="w-full">
        Sold Out
      </Button>
    )
  }

  const handleRSVP = async () => {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to RSVP')

      setRsvpStatus('confirmed')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/rsvp', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to cancel RSVP')

      setRsvpStatus('none')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-terracotta text-center">{error}</p>
      )}

      {rsvpStatus === 'confirmed' ? (
        <div className="space-y-2">
          <Button variant="secondary" size="lg" disabled className="w-full">
            <Check className="w-5 h-5" />
            You&apos;re Going!
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            isLoading={isLoading}
            className="w-full text-terracotta hover:text-terracotta"
          >
            <X className="w-4 h-4" />
            Cancel RSVP
          </Button>
        </div>
      ) : (
        <Button
          variant="primary"
          size="lg"
          onClick={handleRSVP}
          isLoading={isLoading}
          className="w-full"
        >
          Reserve Your Seat
        </Button>
      )}
    </div>
  )
}
