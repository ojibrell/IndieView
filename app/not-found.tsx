import Link from 'next/link'
import { Film } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-6">
          <Film className="w-10 h-10 text-amber" />
        </div>
        <h1 className="font-display text-4xl font-bold text-text-primary mb-3">
          404
        </h1>
        <p className="text-xl text-text-secondary mb-6">
          This screening doesn&apos;t seem to exist.
        </p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  )
}
