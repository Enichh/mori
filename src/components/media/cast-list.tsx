import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { getProfileUrl } from "@/lib/tmdb-image";
import type { CastMember } from "@/types";

interface CastListProps {
  cast: CastMember[];
  className?: string;
}

export function CastList({ cast, className }: CastListProps) {
  if (cast.length === 0) {
    return (
      <p className="text-sm text-muted-foreground font-body">
        No cast information available.
      </p>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4">
        {cast.map((member) => {
          const profileUrl = getProfileUrl(member.profilePath, "w185");

          return (
            <div key={member.id} className="shrink-0 w-24 text-center">
              {/* Profile photo */}
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden bg-muted border border-border mb-2">
                {profileUrl ? (
                  <Image
                    src={profileUrl}
                    alt={member.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Name */}
              <p className="text-xs font-body font-semibold text-foreground line-clamp-2 leading-tight">
                {member.name}
              </p>

              {/* Character */}
              {member.character && (
                <p className="text-[11px] text-muted-foreground font-body line-clamp-1 mt-0.5">
                  {member.character}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
