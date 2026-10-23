import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import {
  getEntryDetail,
  statusColor,
  statusLabel,
  subscribeToEntryUpdates,
  unsubscribeFromEntryUpdates,
  type EntryDetail,
  type IntegrityStatus,
  type ScoreFactor,
} from "@/lib/api";
import ogImg from "@/assets/og-home.jpg";

const SITE_URL = "https://eyespyr.com";
const OG_IMAGE = `${SITE_URL}${ogImg}`;

export const Route = createFileRoute("/entry/$id")({
  loader: async ({ params }) => {
    const entry = await getEntryDetail(params.id);
    if (!entry?.id) throw notFound();
    return entry;
  },
  head: ({ loaderData }) => {
    const id = loaderData?.id ?? "Entry";
    const type = loaderData?.type === "credential" ? "Credential" : "Receipt";
    const title = `${type} ${id} · EyeSpyR Public Ledger`;
    const desc = `Public audit trail for ${type.toLowerCase()} ${id}. Every status change, every score impact, on the record.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `${SITE_URL}/entry/${id}` },
        { property: "og:image", content: OG_IMAGE },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: OG_IMAGE },
      ],
      links: [{ rel: "canonical", href: `${SITE_URL}/entry/${id}` }],
    };
  },
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="eyebrow text-[color:var(--acid)]">Ledger error</p>
        <h1 className="mt-3 font-display text-3xl font-black uppercase">Couldn't load this entry</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error instanceof Error ? error.message : "This record could not be loaded."}</p>
        <Link to="/transparency" className="acid-btn mt-8 inline-flex">Back to Transparency</Link>
      </div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <p className="eyebrow text-[color:var(--acid)]">404</p>
        <h1 className="mt-3 font-display text-3xl font-black uppercase">Entry not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">This reference isn't in the public ledger.</p>
        <Link to="/transparency" className="acid-btn mt-8 inline-flex">Read Evidence Standards</Link>
      </div>
    </SiteLayout>
  ),
  component: EntryDetailPage,
});

function EntryDetailPage() {
  const entry = Route.useLoaderData() as EntryDetail & { demo?: boolean };
  const isCredential = entry.type === "credential";
  const positive = entry.scoreWeightEffect.trim().startsWith("+");

  return (
    <SiteLayout>
      <PageHero
        eyebrow={`Public Ledger · ${isCredential ? "Credential" : "Receipt"}`}
        title={isCredential ? "CREDENTIAL" : "RECEIPT"}
        accent={entry.id}
        lead={
          entry.headline ??
          (isCredential
            ? "Verified operator credential. Every validation step is public."
            : "Verified consumer receipt. Every status change and score impact is public.")
        }
      />

      {/* Summary strip */}
      <section className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="panel grid gap-6 p-6 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <div className="space-y-2">
            {entry.operator && (
              <p className="font-display text-xl font-bold uppercase">{entry.operator}</p>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill status={entry.integrityStatus} />
              {entry.demo && (
                <span className="mono-label border border-border px-2 py-1 text-muted-foreground">
                  DEMO MODE · LIVE API UNREACHABLE
                </span>
              )}
            </div>
          </div>
          <div className="text-right sm:border-l sm:border-border sm:pl-6">
            <p className="mono-label text-muted-foreground">Score Impact</p>
            <p
              className="font-display text-4xl font-black"
              style={{ color: positive ? "var(--acid)" : "#ff5a3d" }}
            >
              {entry.scoreWeightEffect}
            </p>
          </div>
          <ShareButton id={entry.id} />
        </div>

        {/* Receipt-specific details */}
        {!isCredential && (entry.starRating || entry.amount || entry.reviewText) && (
          <div className="panel mt-4 grid gap-6 p-6 sm:grid-cols-3">
            {entry.starRating != null && (
              <MetaBlock label="Rating" value={`${entry.starRating}.0 / 5.0`} />
            )}
            {entry.amount != null && (
              <MetaBlock label="Invoice Amount" value={`$${entry.amount.toLocaleString()}`} />
            )}
            {entry.invoiceDate && <MetaBlock label="Service Date" value={entry.invoiceDate} />}
            {entry.reviewText && (
              <div className="sm:col-span-3">
                <p className="mono-label mb-2 text-muted-foreground">Public Review</p>
                <p className="text-sm leading-relaxed text-foreground/90">"{entry.reviewText}"</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Audit trail */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <p className="eyebrow">Audit Trail</p>
        <h2 className="mt-2 font-display text-3xl font-black uppercase">
          Status <span className="text-[color:var(--acid)]">history</span>
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Every state transition is timestamped and appended. Nothing is deleted, nothing is
          reordered.
        </p>

        <ol className="mt-8 space-y-3">
          {entry.auditTrail.map((e, i) => (
            <li
              key={i}
              className="panel grid gap-4 p-5 sm:grid-cols-[220px_140px_1fr] sm:items-center"
            >
              <p className="mono-label text-muted-foreground">{formatWhen(e.timestamp)}</p>
              <StatusPill status={e.status} />
              <p className="text-sm text-foreground/90">{e.event}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Public score breakdown */}
      {entry.scoreBreakdown && (
        <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
          <ScoreBreakdownPanel breakdown={entry.scoreBreakdown} />
        </section>
      )}

      {/* Email alerts + unsubscribe */}
      <section className="mx-auto max-w-5xl px-5 pb-4 sm:px-8">
        <EmailAlerts entryId={entry.id} />
      </section>

      {/* Score composition explainer */}
      <section className="border-t border-border/60 bg-[color:var(--surface)]/30 px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow">Why this moved the score</p>
          <h3 className="mt-2 font-display text-2xl font-black uppercase">
            {positive ? "Positive weight applied" : "Negative signal recorded"}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {isCredential
              ? "Verified credentials contribute 25% of an operator's overall score and gate the badge. Each document is validated against its issuing body before the weight is applied."
              : positive
                ? "Receipts with a validated invoice weight roughly 3× a drive-by anonymous rating. This entry cleared OCR line-item match against the operator ledger."
                : "Negative reviews carry equal weight to positive. When a verified receipt reports a bad experience, it moves the score just as far in the other direction."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/transparency" className="ghost-btn">See Full Scoring Rules</Link>
            <Link to="/upload-receipt" className="acid-btn">Add Your Own Receipt</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mono-label text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl font-black">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: IntegrityStatus }) {
  const color = statusColor(status);
  return (
    <span
      className="mono-label inline-flex w-fit items-center gap-2 border px-2 py-1"
      style={{ borderColor: color, color }}
    >
      <span
        className="inline-block h-2 w-2"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      {statusLabel(status)}
    </span>
  );
}

function ShareButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : `${SITE_URL}/entry/${id}`;

  async function onShare() {
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({ title: `EyeSpyR Ledger · ${id}`, url });
        return;
      } catch {
        // fall through to copy
      }
    }
    try {
      await nav?.clipboard?.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button onClick={onShare} className="acid-btn justify-center whitespace-nowrap">
      {copied ? "Link Copied ✓" : "Share Public Link"}
    </button>
  );
}

function EmailAlerts({ entryId }: { entryId: string }) {
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"sub" | "unsub">("sub");
  const [state, setState] = useState<"idle" | "sending" | "subscribed" | "unsubscribed" | "demo">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("sending");
    const res =
      mode === "sub"
        ? await subscribeToEntryUpdates(entryId, email.trim())
        : await unsubscribeFromEntryUpdates(entryId, email.trim());
    if (res.demo) setState("demo");
    else setState(mode === "sub" ? "subscribed" : "unsubscribed");
  }

  const busy = state === "sending";
  const isSub = mode === "sub";

  return (
    <div className="panel grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-end">
      <div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setMode("sub"); setState("idle"); }}
            className={`mono-label border px-2 py-1 ${isSub ? "border-[color:var(--acid)] text-[color:var(--acid)]" : "border-border text-muted-foreground"}`}
          >
            SUBSCRIBE
          </button>
          <button
            type="button"
            onClick={() => { setMode("unsub"); setState("idle"); }}
            className={`mono-label border px-2 py-1 ${!isSub ? "border-[color:var(--acid)] text-[color:var(--acid)]" : "border-border text-muted-foreground"}`}
          >
            UNSUBSCRIBE
          </button>
        </div>
        <h3 className="mt-3 font-display text-xl font-black uppercase">
          {isSub ? "Email me when this entry moves" : "Stop status-change emails"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSub
            ? "One email per transition — received → checking → verified / weighted / flagged → resolved."
            : "We'll remove this email from all future notifications for this entry immediately."}
        </p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          maxLength={255}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
          className="min-w-[240px] rounded-none border border-border bg-background px-3 py-2 text-sm outline-none focus:border-[color:var(--acid)]"
          disabled={busy || state === "subscribed" || state === "unsubscribed"}
        />
        <button
          type="submit"
          disabled={busy || state === "subscribed" || state === "unsubscribed"}
          className="acid-btn justify-center whitespace-nowrap"
        >
          {busy
            ? "Working…"
            : state === "subscribed"
              ? "Subscribed ✓"
              : state === "unsubscribed"
                ? "Unsubscribed ✓"
                : isSub
                  ? "Notify Me"
                  : "Unsubscribe"}
        </button>
      </form>
      {state === "demo" && (
        <p className="mono-label text-muted-foreground sm:col-span-2">
          DEMO MODE · Backend unreachable — request queued locally.
        </p>
      )}
    </div>
  );
}

function ScoreBreakdownPanel({
  breakdown,
}: {
  breakdown: NonNullable<EntryDetail["scoreBreakdown"]>;
}) {
  const factorKindLabel: Record<ScoreFactor["kind"], string> = {
    credential: "CREDENTIAL",
    positive_receipt: "POSITIVE RECEIPT",
    negative_receipt: "NEGATIVE RECEIPT",
    penalty: "PENALTY",
  };

  return (
    <div className="panel p-6">
      <p className="eyebrow">Public Score Breakdown</p>
      <h2 className="mt-2 font-display text-2xl font-black uppercase">
        Exact <span className="text-[color:var(--acid)]">contribution</span> per factor
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Baseline {breakdown.baseline} · Current total{" "}
        <span className="font-display text-base font-black text-foreground">
          {breakdown.total}
        </span>
      </p>

      <ul className="mt-6 divide-y divide-border/60">
        {breakdown.factors.map((f) => {
          const positive = f.weightPct >= 0;
          const color = positive ? "var(--acid)" : "#ff5a3d";
          return (
            <li key={f.id} className="grid gap-3 py-4 sm:grid-cols-[160px_1fr_100px] sm:items-center">
              <span
                className="mono-label w-fit border px-2 py-1"
                style={{ borderColor: color, color }}
              >
                {factorKindLabel[f.kind]}
              </span>
              <div>
                <p className="font-display text-sm font-bold uppercase">
                  {f.entryId ? (
                    <Link
                      to="/entry/$id"
                      params={{ id: f.entryId }}
                      className="underline decoration-dotted underline-offset-4 hover:text-[color:var(--acid)]"
                    >
                      {f.label}
                    </Link>
                  ) : (
                    f.label
                  )}
                </p>
                {f.detail && (
                  <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
                )}
              </div>
              <p
                className="font-display text-2xl font-black sm:text-right"
                style={{ color }}
              >
                {positive ? "+" : ""}
                {f.weightPct}%
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}


function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}
