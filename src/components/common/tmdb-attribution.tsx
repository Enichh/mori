import { cn } from '@/lib/utils';

interface TMDBAttributionProps {
  className?: string;
  compact?: boolean;
}

export function TMDBAttribution({ className, compact = false }: TMDBAttributionProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        compact ? 'flex-row text-xs' : 'flex-col sm:flex-row text-xs',
        className
      )}
    >
      {/* TMDB Logo */}
      <a
        href="https://www.themoviedb.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block shrink-0"
      >
        <svg
          viewBox="0 0 132 14"
          className={cn(
            'opacity-60 hover:opacity-100 transition-opacity',
            compact ? 'h-3' : 'h-3.5'
          )}
          fill="currentColor"
        >
          <path
            d="M106.674 3.047h-2.72v7.394h2.72c1.595 0 2.72-1.125 2.72-3.697 0-2.572-1.125-3.697-2.72-3.697zm-2.72 6.825V3.614h2.72c1.312 0 2.154.969 2.154 3.129 0 2.16-.842 3.129-2.154 3.129h-2.72zM115.496 3.047H112.5v7.394h2.996c1.653 0 2.804-1.239 2.804-3.697 0-2.458-1.156-3.697-2.804-3.697zm0 6.825h-2.43V3.614h2.43c1.353 0 2.239 1.026 2.239 3.129 0 2.103-.886 3.129-2.239 3.129zM124.716 3.047h-2.144v7.394h2.144c2.1 0 3.392-1.239 3.392-3.697 0-2.458-1.292-3.697-3.392-3.697zm-.514 6.825h-1.066V3.614h1.066c1.784 0 2.881 1.239 2.881 3.129 0 1.89-1.097 3.129-2.881 3.129zM91.4 3.047h-5.685v.568h2.508v6.826h.669V3.615h2.508zM89.54 3.047l-1.976 2.888h1.2l-.6.88 2.046 2.626h.78l-1.68-2.09 2.07-3.073h-.82zM98.472 3.047h-5.684v.568h2.508v6.826h.669V3.615h2.508zM96.612 3.047l-1.975 2.888h1.2l-.601.88 2.047 2.626h.78l-1.68-2.09 2.07-3.073h-.82z"
            fill="currentColor"
          />
        </svg>
      </a>

      {/* Attribution text */}
      <span className="text-muted-foreground font-body leading-relaxed">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </span>
    </div>
  );
}
