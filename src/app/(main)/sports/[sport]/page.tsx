import type { Metadata } from "next";
import { SportDetailClient } from "./sport-detail-client";

export const revalidate = 3600;

const SPORTS = [
  "basketball",
  "football",
  "baseball",
  "hockey",
  "fight",
  "tennis",
  "golf",
  "cricket",
  "darts",
  "motorsport",
  "american-football",
  "rugby",
];

export function generateStaticParams() {
  return SPORTS.map((s) => ({ sport: s }));
}

interface Props {
  params: Promise<{ sport: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sport } = await params;
  const name =
    sport.charAt(0).toUpperCase() + sport.slice(1).replace(/-/g, " ");
  return {
    title: `${name} | Mori`,
    description: `Stream live ${name} matches and events.`,
  };
}

export default async function SportDetailPage({ params }: Props) {
  const { sport } = await params;
  return <SportDetailClient sport={sport} />;
}
