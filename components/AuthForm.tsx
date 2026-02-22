'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { ROLES } from '@/lib/constants'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('attendee')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const supabase = createClient()

  const validate = (): string | null => {
    if (!email.trim()) return 'Email is required'
    if (!password) return 'Password is required'
    if (password.length < 6) return 'Password must be at least 6 characters'

    if (mode === 'signup') {
      if (!fullName.trim()) return 'Full name is required'
      if (password !== confirmPassword) return 'Passwords do not match'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })
        if (error) throw error
        router.push(redirectTo)
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role,
            },
          },
        })
        if (error) throw error
        router.push(redirectTo)
        router.refresh()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-lg bg-terracotta/10 border border-terracotta/30 text-sm text-terracotta">
          {error}
        </div>
      )}

      {mode === 'signup' && (
        <Input
          label="Full Name"
          type="text"
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); setError('') }}
          placeholder="Your full name"
          required
        />
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError('') }}
        placeholder="you@example.com"
        required
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setError('') }}
        placeholder="Min 6 characters"
        required
      />

      {mode === 'signup' && (
        <>
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
            placeholder="Confirm your password"
            required
          />

          <Select
            label="I am a..."
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={ROLES.map((r) => ({ value: r.value, label: r.label }))}
          />
        </>
      )}

      <Button type="submit" isLoading={isLoading} className="w-full">
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-text-secondary">
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-amber hover:text-amber-light underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Link href="/auth/login" className="text-amber hover:text-amber-light underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
