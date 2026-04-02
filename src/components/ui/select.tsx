import { SelectHTMLAttributes, forwardRef } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  isWide?: boolean
  options: Array<{ value: string; label: string }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, isWide, options, ...props }, ref) => {
    const wrapperClass = `admin-field ${isWide ? 'admin-field-wide' : ''}`.trim()
    
    const selectContent = (
      <select
        ref={ref}
        className={className}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    )

    if (!label) {
      return selectContent
    }

    return (
      <label className={wrapperClass}>
        <span>{label}</span>
        {selectContent}
      </label>
    )
  }
)
Select.displayName = 'Select'
