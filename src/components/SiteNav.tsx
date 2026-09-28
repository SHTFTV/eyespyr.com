import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { EyeMark, Wordmark } from "./EyeMark";

const links = [
  { to: "/trust-layer", label: "Trust Layer" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/transparency", label: "Transparency" },
  { to: "/network", label: "Network" },
  { to: "/where-we-come-from", label: "Our Story" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 sm:flex sm:justify-between sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <EyeMark size={36} score={4.8} className="shrink-0 text-foreground" />
          <div className="flex min-w-0 flex-col leading-tight">
            <Wordmark className="truncate text-xl" />
            <span className="mono-label mt-0.5 text-[0.55rem]">Trust · Verified · IAM</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-2 font-mono text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-[color:var(--acid)]"
              activeProps={{ className: "text-[color:var(--acid)]" }}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/verify-business" className="acid-btn ml-3">
            Get Started
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden inline-flex h-10 w-10 items-center justify-center border border-border text-foreground"
          aria-label="Menu"
        >
          <span className="block h-px w-5 bg-current shadow-[0_-5px_0_currentColor,0_5px_0_currentColor]" />
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 px-5 py-4 sm:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-[color:var(--acid)]"
                activeProps={{ className: "text-[color:var(--acid)]" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/verify-business"
              onClick={() => setOpen(false)}
              className="acid-btn mt-3 justify-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
