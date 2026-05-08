export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

import { AnimeShell } from "./anime-shell";
export default function Page() {
  return <AnimeShell />;
}
