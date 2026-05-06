import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/common/back-button";

export default function NotFound() {
  return (
    <div className="container-cine py-20 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-6 max-w-lg text-center">
        {/* ASCII art */}
        <pre className="ascii-art text-primary/40 mb-4">
          {`    404    `}
          {`  ┌───────┐  `}
          {`  │ >_   │  `}
          {`  │ 404  │  `}
          {`  │ NF   │  `}
          {`  └───────┘  `}
          {` FILE_NOT_FOUND`}
        </pre>

        <div className="text-[120px] md:text-[180px] font-heading font-bold leading-none text-stroke">
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary/60 to-primary/10">
            404
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
          Page Not Found
        </h1>

        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          This realm of the cineverse has yet to be explored.
        </p>

        {/* Terminal box */}
        <div className="terminal-box w-full max-w-sm text-left">
          <p className="text-primary/70 mb-1">$ curl -I /this-page</p>
          <p className="text-destructive/70">HTTP/1.1 404 Not Found</p>
          <p className="text-muted-foreground/50 mt-2">
            Connection closed. Please navigate home.
          </p>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <BackButton className="flex items-center gap-2 px-5 py-2.5 rounded-md border border-border text-muted-foreground hover:text-foreground font-medium text-sm hover:bg-card transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </BackButton>
        </div>
      </div>
    </div>
  );
}
