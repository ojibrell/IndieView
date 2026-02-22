import { Suspense } from 'react'
import AuthForm from '@/components/AuthForm'
import Card from '@/components/ui/Card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your IndieView account.',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
            Join IndieView
          </h1>
          <p className="text-text-secondary">
            Create an account to discover screenings or host your own.
          </p>
        </div>

        <Card variant="dark">
          <Suspense fallback={null}>
            <AuthForm mode="signup" />
          </Suspense>
        </Card>
      </div>
    </div>
  )
}
