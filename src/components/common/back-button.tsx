"use client";

import { cn } from "@/lib/utils";

interface BackButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function BackButton({ children, className }: BackButtonProps) {
  return (
    <button
      onClick={() => window.history.back()}
      className={cn(className)}
      type="button"
    >
      {children}
    </button>
  );
}
