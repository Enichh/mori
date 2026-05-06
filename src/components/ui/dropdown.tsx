'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Dropdown ---

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
  contentClassName?: string;
}

function Dropdown({ trigger, children, align = 'left', className, contentClassName }: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger}
      </div>

      {open && (
        <div
          className={cn(
            'absolute top-full mt-1 z-50 min-w-[180px]',
            'bg-card border border-border shadow-lg',
            'animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0',
            contentClassName
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// --- DropdownItem ---

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  disabled?: boolean;
}

function DropdownItem({ children, onClick, active = false, className, disabled = false }: DropdownItemProps) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left px-4 py-2.5 text-sm font-body text-foreground',
        'hover:bg-muted transition-colors',
        'disabled:opacity-50 disabled:pointer-events-none',
        active && 'bg-primary/10 text-primary border-l-2 border-primary',
        className
      )}
    >
      {children}
    </button>
  );
}

// --- DropdownLabel ---

function DropdownLabel({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'block px-4 py-2 text-xs font-body font-semibold text-muted-foreground uppercase tracking-wider',
        className
      )}
      {...props}
    />
  );
}

// --- DropdownSeparator ---

function DropdownSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('h-px bg-border my-1', className)} {...props} />;
}

// --- DropdownTrigger (convenience styled trigger) ---

interface DropdownTriggerProps {
  label: string;
  className?: string;
}

function DropdownTrigger({ label, className }: DropdownTriggerProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 h-10 px-4 text-sm font-body',
        'bg-muted border border-border text-foreground',
        'hover:bg-card-hover transition-colors cursor-pointer',
        className
      )}
    >
      {label}
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </span>
  );
}

export { Dropdown, DropdownItem, DropdownLabel, DropdownSeparator, DropdownTrigger };
