import { cn } from '@/lib/utils'

interface BadgeProps {
  variant?: 'default' | 'free' | 'genre' | 'status' | 'sold_out' | 'past'
  children: React.ReactNode
  className?: string
}

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-bg-elevated text-text-secondary',
    free: 'bg-sage/20 text-sage',
    genre: 'bg-amber/15 text-amber',
    status: 'bg-amber/15 text-amber',
    sold_out: 'bg-terracotta/15 text-terracotta',
    past: 'bg-bg-elevated text-text-secondary',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
