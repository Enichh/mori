import { EpisodeShell } from "./episode-shell";

export function generateStaticParams() {
  return [{ id: "placeholder", season: "1", episode: "1" }];
}

export default function Page() {
  return <EpisodeShell />;
}
