'use client';

import { ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dropdown, DropdownItem, DropdownTrigger } from '@/components/ui/dropdown';
import type { SortOption, SortItem } from '@/types';

const defaultSortOptions: SortItem[] = [
  { value: 'popularity.desc', label: 'Popularity' },
  { value: 'vote_average.desc', label: 'Rating' },
  { value: 'release_date.desc', label: 'Release Date' },
  { value: 'original_title.asc', label: 'Title (A-Z)' },
];

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  options?: SortItem[];
  className?: string;
}

export function SortDropdown({
  value,
  onChange,
  options = defaultSortOptions,
  className,
}: SortDropdownProps) {
  const currentLabel = options.find((opt) => opt.value === value)?.label || 'Sort';

  return (
    <Dropdown
      trigger={
        <DropdownTrigger
          label={currentLabel}
          className={className}
        />
      }
      align="right"
    >
      <div className="py-1">
        {options.map((option) => (
          <DropdownItem
            key={option.value}
            active={value === option.value}
            onClick={() => onChange(option.value)}
          >
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              {option.label}
            </div>
          </DropdownItem>
        ))}
      </div>
    </Dropdown>
  );
}
