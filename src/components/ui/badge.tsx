import * as React from 'react';
import { cn } from '@/lib/utils';

const variantStyles = {
  default: 'bg-muted text-muted-foreground border border-border',
  primary: 'bg-primary text-primary-foreground border border-primary',
  secondary: 'bg-card text-card-foreground border border-border',
  outline: 'bg-transparent text-foreground border border-border',
} as const;

type BadgeVariant = keyof typeof variantStyles;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-body font-medium rounded-none',
        'transition-colors duration-150',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
);
Badge.displayName = 'Badge';

export { Badge };
