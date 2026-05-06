'use client';

import { cn } from '@/lib/utils';
import type { Genre } from '@/types';

interface GenreFilterProps {
  genres: Genre[];
  selected: number[];
  onChange: (genres: number[]) => void;
  className?: string;
}

export function GenreFilter({ genres, selected, onChange, className }: GenreFilterProps) {
  const toggleGenre = (genreId: number) => {
    if (selected.includes(genreId)) {
      onChange(selected.filter((id) => id !== genreId));
    } else {
      onChange([...selected, genreId]);
    }
  };

  return (
    <div className={cn('', className)}>
      <h3 className="font-heading text-sm text-foreground uppercase tracking-wider mb-3">
        Genres
      </h3>
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => {
          const isActive = selected.includes(genre.id);

          return (
            <button
              key={genre.id}
              onClick={() => toggleGenre(genre.id)}
              className={cn(
                'px-3 py-1.5 text-xs font-body font-medium transition-all duration-200',
                'border',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-border hover:text-foreground hover:border-primary/30'
              )}
            >
              {genre.name}
            </button>
          );
        })}
      </div>

      {/* Clear selection */}
      {selected.length > 0 && (
        <button
          onClick={() => onChange([])}
          className="mt-3 text-xs text-muted-foreground hover:text-primary transition-colors font-body"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
