'use client'

import { cn } from '@/lib/utils'
import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  variant?: 'dark' | 'light'
  options: { value: string; label: string }[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, variant = 'dark', options, placeholder, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const baseStyles = 'w-full rounded-lg px-4 py-3 text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber/50 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat'

    const variants = {
      dark: 'bg-bg-secondary border border-border-subtle text-text-primary',
      light: 'bg-white border border-border-light text-text-on-light',
    }

    // Chevron down SVG as data URI
    const chevronStyle = {
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23A8A29E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            baseStyles,
            variants[variant],
            error && 'border-terracotta focus:ring-terracotta/50',
            className
          )}
          style={chevronStyle}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-terracotta">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'
export default Select
