export function generateStaticParams() {
  return [{ id: "placeholder", season: "1", episode: "1" }];
}

import { WatchTVShell } from "./watch-tv-shell";
export default function Page() {
  return <WatchTVShell />;
}
