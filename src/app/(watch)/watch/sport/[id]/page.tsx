import { WatchSportShell } from "./watch-sport-shell";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return <WatchSportShell />;
}
