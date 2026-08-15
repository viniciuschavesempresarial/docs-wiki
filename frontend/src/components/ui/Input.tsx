import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  'data-testid'?: string;
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, 'data-testid': testId, label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            {label}
          </label>
        )}
        <input
          id={id}
          data-testid={testId || id}
          ref={ref}
          className={twMerge(
            clsx(
              'w-full px-3.5 py-2.5 bg-slate-900 border rounded-lg text-slate-100 text-sm placeholder:text-slate-500 transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
              error ? 'border-rose-500/80 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-800 hover:border-slate-700',
              className
            )
          )}
          {...props}
        />
        {error && <span className="text-xs text-rose-400 font-medium">{error}</span>}
        {!error && helperText && <span className="text-xs text-slate-400">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
