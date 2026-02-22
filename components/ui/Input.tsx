'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  variant?: 'dark' | 'light'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, variant = 'dark', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const baseStyles = 'w-full rounded-lg px-4 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber/50 placeholder:text-text-secondary'

    const variants = {
      dark: 'bg-bg-secondary border border-border-subtle text-text-primary',
      light: 'bg-white border border-border-light text-text-on-light',
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
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

Input.displayName = 'Input'
export default Input
