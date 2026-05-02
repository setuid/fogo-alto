import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-xl border border-ink/15 bg-cream-paper px-3 py-2 text-sm text-ink shadow-sm transition-colors placeholder:text-ink/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tomato focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export { Input };
