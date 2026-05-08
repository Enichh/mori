import { WatchAnimeShell } from "./watch-anime-shell";

export function generateStaticParams() {
  return [{ id: "placeholder", episode: "1" }];
}

export default function Page() {
  return <WatchAnimeShell />;
}
