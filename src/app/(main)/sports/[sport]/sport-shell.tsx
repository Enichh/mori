"use client";
import { SportDetailClient } from "./sport-detail-client";

export function SportShell() {
  const sport =
    typeof window !== "undefined"
      ? window.location.pathname.split("/").filter(Boolean).pop() || ""
      : "";
  return <SportDetailClient sport={sport} />;
}
