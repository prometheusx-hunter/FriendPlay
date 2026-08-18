import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className, ...rest }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="flex flex-col gap-1.5 text-left">
        <label htmlFor={inputId} className="text-xs font-medium text-ink/70 tracking-wide">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'rounded-md border bg-parchment px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/40 outline-none transition-colors duration-150 focus:border-gold',
            error ? 'border-ruby' : 'border-ink/15',
            className,
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-ruby">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
