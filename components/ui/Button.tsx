'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber/50 focus:ring-offset-2 focus:ring-offset-bg-primary disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'bg-amber text-bg-primary hover:bg-amber-light active:bg-amber-dark',
      secondary: 'bg-bg-elevated text-text-primary hover:bg-border-subtle',
      outline: 'border-2 border-amber text-amber hover:bg-amber/10',
      ghost: 'text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
      danger: 'bg-terracotta text-white hover:brightness-110',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm gap-1.5',
      md: 'h-11 px-5 text-base gap-2',
      lg: 'h-13 px-8 text-lg gap-2.5',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isLoading ? 'Loading...' : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
