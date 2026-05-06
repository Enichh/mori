"use client";

import { cn } from "@/lib/utils";
import type { PlayerServer } from "@/types";

export interface ServerOption {
  id: PlayerServer;
  label: string;
  available: boolean;
}

interface ServerSelectorProps {
  servers: ServerOption[];
  active: PlayerServer;
  onChange: (server: PlayerServer) => void;
  className?: string;
}

export function ServerSelector({
  servers,
  active,
  onChange,
  className,
}: ServerSelectorProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {servers.map((server) => {
        const isActive = active === server.id;

        return (
          <button
            key={server.id}
            onClick={() => server.available && onChange(server.id)}
            disabled={!server.available}
            className={cn(
              "px-4 py-2 text-sm font-body font-medium transition-all duration-200",
              "disabled:opacity-40 disabled:pointer-events-none",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-card-hover border border-border",
            )}
          >
            <span className="flex items-center gap-2">
              {server.label}
              {!server.available && (
                <span className="text-[10px] opacity-70">(offline)</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
