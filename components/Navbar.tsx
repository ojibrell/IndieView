'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Plus, LayoutDashboard, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import Button from '@/components/ui/Button'

export default function Navbar() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser({ id: user.id, email: user.email })
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (profile) setProfile(profile)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser({ id: session.user.id, email: session.user.email })
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (profile) setProfile(profile)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setProfileMenuOpen(false)
    setMobileMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/80 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-display text-2xl font-bold text-amber hover:text-amber-light transition-colors">
            IndieView
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">
              Home
            </Link>
            <Link href="/events" className="text-text-secondary hover:text-text-primary transition-colors">
              Browse Events
            </Link>

            {user ? (
              <div className="flex items-center gap-4">
                {profile?.role === 'creator' && (
                  <Link href="/events/create">
                    <Button size="sm" variant="primary">
                      <Plus className="w-4 h-4" />
                      Create Event
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors">
                  <LayoutDashboard className="w-5 h-5" />
                </Link>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-amber" />
                    </div>
                    <span className="text-sm">{profile?.display_name || profile?.full_name || 'Profile'}</span>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-bg-secondary border border-border-subtle shadow-xl py-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Edit Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                        onClick={() => setProfileMenuOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <hr className="my-1 border-border-subtle" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-terracotta hover:bg-bg-elevated transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-subtle bg-bg-primary/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block py-2 text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/events"
              className="block py-2 text-text-secondary hover:text-text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Events
            </Link>

            {user ? (
              <>
                {profile?.role === 'creator' && (
                  <Link
                    href="/events/create"
                    className="block py-2 text-amber hover:text-amber-light transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Event
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="block py-2 text-text-secondary hover:text-text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block py-2 text-text-secondary hover:text-text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left py-2 text-terracotta hover:brightness-110 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-3 pt-2">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
