import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center film-grain overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-primary to-bg-secondary" />

      {/* Decorative ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-amber/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h1 className="font-display text-5xl md:text-7xl font-bold italic text-amber mb-6 leading-tight">
          Discover indie film screenings near you
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
          Where independent filmmakers host screenings and audiences discover
          unique film experiences.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/events">
            <Button size="lg">Browse Events</Button>
          </Link>
          <Link href="/events/create">
            <Button variant="outline" size="lg">
              Host a Screening
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-secondary to-transparent" />
    </section>
  )
}
