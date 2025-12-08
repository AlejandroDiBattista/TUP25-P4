import * as React from 'react';
import { cn } from './utils';

type Variant = 'default' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
const variants: Record<Variant, string> = {
  default: 'bg-gray-900 text-white hover:bg-black focus:ring-gray-900',
  outline: 'border border-gray-900 text-gray-900 hover:bg-gray-100',
  ghost: 'text-gray-900 hover:bg-gray-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  lg: 'h-12 px-6 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  )
);
Button.displayName = 'Button';
