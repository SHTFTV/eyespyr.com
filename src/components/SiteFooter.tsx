import { Link } from "@tanstack/react-router";
import { Wordmark } from "./EyeMark";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-[color:var(--surface)]/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:px-8">
        <div>
          <Wordmark className="text-2xl" />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Business credential checks for the Industry Army Marketing network. Early access: secure
            uploads and monitoring are still being prepared.
          </p>
          <p className="mono-label mt-4">Vancouver · BC · Early access</p>
        </div>
        <FooterCol
          title="Platform"
          items={[
            { to: "/how-it-works", label: "How It Works" },
            { to: "/transparency", label: "Scoring Transparency" },
            { to: "/eyespyr", label: "The Badge" },
            { to: "/scan", label: "Free Scan" },
            { to: "/talc-tv", label: "TALC.tv Blast" },
          ]}
        />
        <FooterCol
          title="Verify"
          items={[
            { to: "/verify-business", label: "For Businesses" },
            { to: "/upload-receipt", label: "For Consumers" },
            { to: "/network", label: "Coverage Map" },
            { to: "/pricing", label: "Pricing" },
          ]}
        />

        <FooterCol
          title="Legal"
          items={[
            { href: "mailto:legal@industryarmymarketing.com", label: "Contact Legal" },
            { href: "/IAM-Privacy-Policy.pdf", label: "Privacy" },
            { href: "/IAM-Terms-of-Service.pdf", label: "Terms" },
            { href: "/IAM-Legal-Notice.pdf", label: "Legal Notice" },
          ]}
        />
      </div>
      <div className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 sm:px-8">
          <p className="mono-label">© 2026 Industry Army Marketing Inc.</p>
          <p className="mono-label">
            Status · <span className="text-[color:var(--acid)]">Preparing for launch</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

type Item = { to?: string; href?: string; label: string; external?: boolean };
function FooterCol({ title, items }: { title: string; items: Item[] }) {
  return (
    <div>
      <p className="mono-label mb-3">{title}</p>
      <ul className="space-y-2 text-sm">
        {items.map((i) => (
          <li key={i.label}>
            {i.to ? (
              <Link to={i.to} className="text-muted-foreground hover:text-[color:var(--acid)]">
                {i.label}
              </Link>
            ) : (
              <a
                href={i.href}
                target={i.external ? "_blank" : undefined}
                rel={i.external ? "noreferrer" : undefined}
                className="text-muted-foreground hover:text-[color:var(--acid)]"
              >
                {i.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
