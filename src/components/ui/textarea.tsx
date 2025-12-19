"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  required?: boolean
  helperText?: string
  containerClassName?: string
  labelClassName?: string
  errorClassName?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      required = false,
      helperText,
      containerClassName,
      labelClassName,
      errorClassName,
      id,
      ...props
    },
    ref
  ) => {
    const textareaId = id || React.useId()
    const errorId = `${textareaId}-error`
    const helperTextId = `${textareaId}-helper`

    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "block text-sm font-medium text-gray-700",
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-secondary/60 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 resize-vertical selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-blue-800 dark:selection:text-blue-100",
            error && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500",
            className
          )}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={cn(
            error && errorId,
            helperText && helperTextId
          )}
          {...props}
        />
        
        {helperText && !error && (
          <p
            id={helperTextId}
            className={cn("text-sm text-gray-500", errorClassName)}
          >
            {helperText}
          </p>
        )}
        
        {error && (
          <p
            id={errorId}
            className={cn("text-sm text-red-600", errorClassName)}
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }
