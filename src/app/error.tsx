"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="container-cine py-20 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        {/* ASCII error icon */}
        <div className="ascii-art text-destructive/60 mb-2">
          {`    ERROR    `}
          {`  ┌────────┐  `}
          {`  │  ◉  ◉  │  `}
          {`  │    ∆    │  `}
          {`  │  └──┘  │  `}
          {`  └────────┘  `}
        </div>

        <AlertTriangle className="w-16 h-16 text-destructive" />

        <h2 className="text-2xl font-heading font-bold text-foreground">
          Something Went Wrong
        </h2>

        <p className="text-sm text-muted-foreground leading-relaxed">
          An unexpected error occurred while loading this page.
          This could be due to a network issue or an API being temporarily unavailable.
        </p>

        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground bg-card px-3 py-1 rounded">
            Error ID: {error.digest}
          </p>
        )}

        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
