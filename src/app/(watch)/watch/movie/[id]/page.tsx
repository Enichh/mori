export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

import { WatchMovieShell } from "./watch-movie-shell";
export default function Page() {
  return <WatchMovieShell />;
}
