'use client'

import { cn } from '@/lib/utils'
import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  variant?: 'dark' | 'light'
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, variant = 'dark', id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const baseStyles = 'w-full rounded-lg px-4 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber/50 placeholder:text-text-secondary resize-y min-h-[120px]'

    const variants = {
      dark: 'bg-bg-secondary border border-border-subtle text-text-primary',
      light: 'bg-white border border-border-light text-text-on-light',
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            baseStyles,
            variants[variant],
            error && 'border-terracotta focus:ring-terracotta/50',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-terracotta">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
export default Textarea
