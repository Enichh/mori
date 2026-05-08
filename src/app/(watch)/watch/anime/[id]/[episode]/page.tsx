export function generateStaticParams() {
  return [{ id: "placeholder", episode: "1" }];
}

import { WatchAnimeShell } from "./watch-anime-shell";
export default function Page() {
  return <WatchAnimeShell />;
}
