import { TVShell } from "./tv-shell";

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function Page() {
  return <TVShell />;
}
