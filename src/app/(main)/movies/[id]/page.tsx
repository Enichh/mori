import { MovieShell } from "./movie-shell";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return <MovieShell />;
}
