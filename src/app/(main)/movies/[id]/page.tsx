export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

import { MovieShell } from "./movie-shell";
export default function Page() {
  return <MovieShell />;
}
