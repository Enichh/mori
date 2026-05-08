import { AnimeShell } from "./anime-shell";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return <AnimeShell />;
}
