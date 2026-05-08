import { SportShell } from "./sport-shell";

export function generateStaticParams() {
  return [{ sport: "basketball" }];
}

export default function Page() {
  return <SportShell />;
}
