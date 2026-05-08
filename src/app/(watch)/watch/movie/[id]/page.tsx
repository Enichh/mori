import { WatchMovieShell } from "./watch-movie-shell";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return <WatchMovieShell />;
}
