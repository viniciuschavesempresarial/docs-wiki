import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  'data-testid'?: string;
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, 'data-testid': testId, label, className, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className="inline-flex items-center gap-2.5 cursor-pointer select-none group text-sm text-slate-300 hover:text-slate-100"
      >
        <input
          id={id}
          data-testid={testId || id}
          ref={ref}
          type="checkbox"
          className={twMerge(
            clsx(
              'w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-600 focus:ring-brand-500 focus:ring-offset-slate-950 transition cursor-pointer',
              className
            )
          )}
          {...props}
        />
        {label && <span>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
