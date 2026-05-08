export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

import { TVShell } from "./tv-shell";
export default function Page() {
  return <TVShell />;
}
