"use client";

import { NativeBanner, CONTAINER_ID } from "./native-banner";
import type { ComponentProps } from "react";

type NativeBannerProps = ComponentProps<typeof NativeBanner>;

/**
 * InlineAd — Compact in-content banner.
 * Uses the single native banner zone. Only renders when it's the sole
 * NativeBanner on the page (won't duplicate if primary is already present).
 */
export function InlineAd(
  props: Omit<NativeBannerProps, "variant" | "containerId"> & {
    containerId?: string;
  },
) {
  return (
    <NativeBanner
      variant="compact"
      containerId={props.containerId ?? CONTAINER_ID}
      {...props}
    />
  );
}
