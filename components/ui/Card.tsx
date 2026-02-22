import { cn } from '@/lib/utils'

interface CardProps {
  variant?: 'light' | 'dark'
  children: React.ReactNode
  className?: string
}

export default function Card({ variant = 'light', children, className }: CardProps) {
  const variants = {
    light: 'bg-bg-card text-text-on-light',
    dark: 'bg-bg-card-dark text-text-primary',
  }

  return (
    <div
      className={cn(
        'rounded-2xl p-6 shadow-lg shadow-stone-900/20',
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  )
}
