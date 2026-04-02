import { TextareaHTMLAttributes, forwardRef } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  isWide?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, isWide, ...props }, ref) => {
    const wrapperClass = `admin-field ${isWide ? 'admin-field-wide' : ''}`.trim()
    
    const textareaContent = (
      <textarea
        ref={ref}
        className={className}
        {...props}
      />
    )

    if (!label) {
      return textareaContent
    }

    return (
      <label className={wrapperClass}>
        <span>{label}</span>
        {textareaContent}
      </label>
    )
  }
)
Textarea.displayName = 'Textarea'
