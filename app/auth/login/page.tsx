import { Suspense } from 'react'
import AuthForm from '@/components/AuthForm'
import Card from '@/components/ui/Card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your IndieView account.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
            Welcome Back
          </h1>
          <p className="text-text-secondary">
            Sign in to discover and manage your screenings.
          </p>
        </div>

        <Card variant="dark">
          <Suspense fallback={null}>
            <AuthForm mode="login" />
          </Suspense>
        </Card>
      </div>
    </div>
  )
}
