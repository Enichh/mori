export function generateStaticParams() {
  return [{ sport: "basketball" }];
}

import { SportShell } from "./sport-shell";
export default function Page() {
  return <SportShell />;
}
