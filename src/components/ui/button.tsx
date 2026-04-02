import { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`admin-button admin-button-${variant} ${className}`}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'
