import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  'data-testid'?: string;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  id,
  'data-testid': testId,
  interactive = false,
  className,
  children,
  ...props
}) => {
  return (
    <div
      id={id}
      data-testid={testId || id}
      className={twMerge(
        clsx(
          'bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-xl p-5 transition-all duration-200',
          interactive && 'hover:border-slate-700 hover:bg-slate-900/90 hover:shadow-lg hover:shadow-brand-950/20 cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
