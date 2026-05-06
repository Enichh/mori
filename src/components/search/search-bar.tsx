'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search movies, TV shows, anime...',
  defaultValue = '',
  className,
}: SearchBarProps) {
  const [value, setValue] = React.useState(defaultValue);
  const debouncedValue = useDebounce(value, 300);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Trigger search on debounced value change
  React.useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    setValue('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      <div className="relative flex items-center">
        <Search className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full h-12 pl-12 pr-20 text-sm font-body',
            'bg-muted border border-border text-foreground',
            'placeholder:text-muted-foreground',
            'transition-all duration-200',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-card'
          )}
        />

        {/* Keyboard shortcut hint */}
        <kbd className="absolute right-4 hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-muted-foreground bg-card border border-border">
          Ctrl+K
        </kbd>
      </div>
    </div>
  );
}
