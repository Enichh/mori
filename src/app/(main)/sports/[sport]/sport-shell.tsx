"use client";
import { useParams } from "next/navigation";
import { SportDetailClient } from "./sport-detail-client";

export function SportShell() {
  const { sport } = useParams<{ sport: string }>();
  return <SportDetailClient sport={sport || ""} />;
}
