'use client';

import * as React from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Input ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'search';
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', variant = 'default', onClear, value, ...props }, ref) => {
    const showClear = variant === 'search' && onClear && value && String(value).length > 0;

    return (
      <div className="relative w-full">
        {variant === 'search' && (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          className={cn(
            // Base
            'w-full h-10 bg-muted border border-border rounded-none font-body text-sm text-foreground',
            'placeholder:text-muted-foreground',
            'transition-all duration-200',
            // Focus
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
            // Disabled
            'disabled:pointer-events-none disabled:opacity-50',
            // Padding based on variant
            variant === 'search' ? 'pl-10 pr-4' : 'px-4',
            showClear && 'pr-10',
            className
          )}
          {...props}
        />
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
