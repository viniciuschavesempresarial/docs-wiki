import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  id: string;
  'data-testid'?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'purple' | 'outline';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  id,
  'data-testid': testId,
  variant = 'secondary',
  children,
  className,
}) => {
  const variants = {
    primary: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    secondary: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    outline: 'bg-transparent text-slate-400 border-slate-700',
  };

  return (
    <span
      id={id}
      data-testid={testId || id}
      className={twMerge(
        clsx(
          'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border font-mono tracking-tight',
          variants[variant],
          className
        )
      )}
    >
      {children}
    </span>
  );
};
