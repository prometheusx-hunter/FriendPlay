import type { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        'w-full rounded-md px-4 py-2.5 font-body font-semibold text-sm tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'bg-gold text-ink hover:bg-gold-bright active:bg-gold',
        variant === 'ghost' &&
          'bg-transparent text-parchment border border-felt-line hover:border-gold hover:text-gold',
        className,
      )}
      {...rest}
    >
      {isLoading ? 'অপেক্ষা করুন…' : children}
    </button>
  );
}
