// Smartlinks removed — keeping no-op exports for compatibility
export function getSmartlinkUrl(): string {
  return "#";
}
export function wrapWithSmartlink(url: string): string {
  return url; // passthrough — no smartlink
}
export function openSmartlink() {
  // no-op
}
