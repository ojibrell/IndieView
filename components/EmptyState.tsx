import { Film } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  icon?: React.ReactNode
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-bg-elevated flex items-center justify-center mb-6">
        {icon || <Film className="w-8 h-8 text-text-secondary" />}
      </div>
      <h3 className="text-xl font-display font-semibold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-text-secondary max-w-md mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary">{actionLabel}</Button>
        </Link>
      )}
    </div>
  )
}
