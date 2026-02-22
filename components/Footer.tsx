import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-primary">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="font-display text-xl font-bold text-amber">
              IndieView
            </Link>
            <p className="text-sm text-text-secondary">
              Discover and host indie film screenings
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-text-secondary">
            <Link href="/events" className="hover:text-text-primary transition-colors">
              Browse Events
            </Link>
            <Link href="/events/create" className="hover:text-text-primary transition-colors">
              Host a Screening
            </Link>
            <Link href="/auth/signup" className="hover:text-text-primary transition-colors">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border-subtle text-center text-xs text-text-secondary">
          &copy; {new Date().getFullYear()} IndieView. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
