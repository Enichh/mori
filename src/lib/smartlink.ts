import { AD_CONFIG } from "@/config/ads";

export function getSmartlinkUrl(): string {
  return AD_CONFIG.smartlink.url;
}

/**
 * Wrap any URL with the smartlink for monetization.
 * Use for external links that users click (e.g., stream sources).
 */
export function wrapWithSmartlink(destinationUrl: string): string {
  return `${AD_CONFIG.smartlink.url}&url=${encodeURIComponent(destinationUrl)}`;
}

/**
 * Open smartlink in a new tab (for "no stream available" fallback).
 */
export function openSmartlink() {
  window.open(AD_CONFIG.smartlink.url, "_blank", "noopener,noreferrer");
}
