'use client'

import { useEffect } from 'react'
import Button from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-text-primary mb-3">
          Something went wrong
        </h1>
        <p className="text-text-secondary mb-6">
          We hit an unexpected error. Please try again.
        </p>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  )
}
