import { InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  isWide?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, isWide, ...props }, ref) => {
    const wrapperClass = `admin-field ${isWide ? 'admin-field-wide' : ''}`.trim()
    
    const inputContent = (
      <input
        ref={ref}
        className={className}
        {...props}
      />
    )

    if (!label) {
      return inputContent
    }

    return (
      <label className={wrapperClass}>
        <span>{label}</span>
        {inputContent}
      </label>
    )
  }
)
Input.displayName = 'Input'
