export function generateStaticParams() {
  return [{ id: "placeholder", season: "1", episode: "1" }];
}

import { EpisodeShell } from "./episode-shell";
export default function Page() {
  return <EpisodeShell />;
}
