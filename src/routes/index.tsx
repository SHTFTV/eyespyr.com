import { JournalCards } from "@/components/ContentJournal";
import { SourceStory } from "@/components/SourceStory";
import { MarkEttHero } from "@/components/MarkEttHero";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ScanBar } from "@/components/ScanBar";
import { EyeMark } from "@/components/EyeMark";

const SITE_URL = "https://eyespyr.com";
const OG_IMAGE = `${SITE_URL}/markett/share-v1.jpg`;


const HOME_DESC =
  "Verified business identity for the AI-search era: credentials matched to authoritative records, receipt-backed reviews, and timestamped provenance. Built for the trades first.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EyeSpyR — Trusted Business Identity Infrastructure" },
      { name: "description", content: HOME_DESC },
      { property: "og:title", content: "EyeSpyR — Trusted Business Identity Infrastructure" },
      { property: "og:description", content: HOME_DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:alt", content: "EyeSpyR — Go beyond the claim. Find the source." },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "EyeSpyR — Trusted Business Identity Infrastructure" },
      { name: "twitter:description", content: HOME_DESC },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],

  }),
  component: Index,
});


const pillars = [
  {
    tag: "Pillar 01",
    title: "I — Intelligence",
    body: "Continuous OSINT sweep of every listing, review platform, and business record. Anomalies trigger review before customers see them.",
  },
  {
    tag: "Pillar 02",
    title: "S — Security",
    body: "Website integrity, malware scans, link hygiene, DNS posture. If a member site breaks, we know before their next customer clicks.",
  },
  {
    tag: "Pillar 03",
    title: "P — Provenance",
    body: "Every review, endorsement and score is chained to a verified source. No purchased reputation, no laundered stars, no gaming the aggregate.",
  },
  {
    tag: "Pillar 04",
    title: "R — Response",
    body: "Sub-5-minute alert loop. A negative signal triggers member, IAM ops, and QA in parallel — remediated before it compounds.",
  },
];

const slas = [
  { tier: "P0", time: "5m", desc: "Reputation attack detected" },
  { tier: "P1", time: "1h", desc: "Score drop investigation" },
  { tier: "P2", time: "24h", desc: "Content dispute triage" },
  { tier: "P3", time: "72h", desc: "Territory audit review" },
];

function Index() {
  return (
    <SiteLayout>
      <MarkEttHero name="EyeSpyR" brand={<><EyeMark size={88} score={0}/><span>Eye<span style={{color:"#b7ed4b"}}>SpyR</span></span></>} eyebrow="IDENTITY · SOURCES · PROVENANCE" title="Go beyond the claim. Find the source." description="Bring your business identity, supporting records and questions into focus. Explore the trust framework and build your verification checklist." primaryHref="/verify-business" primaryLabel="Build your checklist" secondaryHref="/how-it-works" secondaryLabel="How it works" accent="#b7ed4b" cardTitle="Start with the source." cardText="Prepare your business details and supporting records. The checklist helps you organise what to review; opening it does not verify your business."/>

      <div className="mx-auto max-w-3xl px-5 pb-10 sm:px-8"><ScanBar /></div>

      <SourceStory image="/markett/source-records-v2.webp" label="01 / IDENTITY" title="A name is the start. Records add context." description="Business identity begins with details you can trace: who operates the business, where records come from and when they were checked." href="/verify-business" link="Prepare your business details"/>

      {/* Pillars */}
      <section className="border-y border-border/60 bg-[color:var(--surface)]/30 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-center">The I-S-P-R System</p>
          <h2 className="mt-3 text-center font-display text-4xl font-black uppercase sm:text-5xl">
            Four <span className="text-[color:var(--acid)]">Pillars</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Four independent data streams. All live. All auditable. Together they hold the Trust Standard.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {pillars.map((p) => (
              <div key={p.title} className="panel group p-7 transition-colors hover:border-[color:var(--acid)]">
                <p className="mono-label">{p.tag}</p>
                <h3 className="mt-2 font-display text-2xl font-bold uppercase text-[color:var(--acid)]">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SourceStory image="/markett/source-signals-v2.webp" label="02 / INDEPENDENT SOURCES" title="Look at the evidence from more than one angle." description="Different records tell different parts of a story. Understand what each source supports, what remains uncertain and what needs another look." href="/how-it-works" link="Explore the framework"/>

      {/* SLA */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Service Level</p>
            <h2 className="mt-3 font-display text-4xl font-black uppercase sm:text-5xl">
              Response <span className="text-[color:var(--acid)]">Windows</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Every event is triaged by severity. No ticket rots. No signal ignored.
          </p>
        </div>
        <div className="mt-8 grid gap-px bg-border sm:grid-cols-4">
          {slas.map((s) => (
            <div key={s.tier} className="bg-background p-6 transition-colors hover:bg-[color:var(--surface)]">
              <p className="mono-label">Priority {s.tier}</p>
              <p className="mt-3 font-display text-5xl font-black">{s.time}</p>
              <p className="mt-3 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <SourceStory image="/markett/source-provenance-v2.webp" label="03 / PROVENANCE" title="Connect the claim to the work." description="A project photograph, a service record and its source can add useful context. Keep the original evidence and its limitations in view." href="/transparency" link="Read about transparency"/>

      {/* Two-sided verification */}
      <section className="border-y border-border/60 bg-[color:var(--surface)]/30 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-center">Two-Sided Verification</p>
          <h2 className="mt-3 text-center font-display text-4xl font-black uppercase sm:text-5xl">
            Proof from <span className="text-[color:var(--acid)]">both sides</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            This is the best-of-the-best network. Operators prove they belong. Consumers prove the work happened. Everything else is noise.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="panel p-7">
              <p className="mono-label">For Operators</p>
              <h3 className="mt-2 font-display text-2xl font-bold uppercase text-[color:var(--acid)]">Credentials, Uploaded</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Companies upload business licenses, trade qualifications, insurance, WCB clearance, and any other certifications straight into their profile. We verify each document against the issuing body. If it can't be validated, the badge doesn't issue.
              </p>
              <ul className="mono-label mt-5 space-y-1.5 text-muted-foreground">
                <li>· Business license &amp; registration</li>
                <li>· Trade tickets &amp; Red Seal certificates</li>
                <li>· Liability insurance &amp; WCB clearance</li>
                <li>· Manufacturer / industry accreditations</li>
              </ul>
              <Link to="/verify-business" className="acid-btn mt-6">Verify a Business</Link>
            </div>

            <div className="panel p-7">
              <p className="mono-label">For Consumers</p>
              <h3 className="mt-2 font-display text-2xl font-bold uppercase text-[color:var(--acid)]">Receipts, Weighted</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Customers upload a real receipt or invoice with their review. Verified purchases carry more weight in the score — good or bad. Anonymous reviews still show, but they don't move the number the way a proof-of-transaction review does.
              </p>
              <ul className="mono-label mt-5 space-y-1.5 text-muted-foreground">
                <li>· Upload receipt, invoice, or work order</li>
                <li>· Verified purchases weighted higher</li>
                <li>· Negative reviews carry the same weight as positive</li>
                <li>· Consumers protected — businesses can't bury the truth</li>
              </ul>
              <Link to="/upload-receipt" className="acid-btn mt-6">Upload a Receipt</Link>
            </div>
          </div>

          <p className="mono-label mt-10 text-center text-muted-foreground">
            We monitor the open web for reviews and brand-use signal 24/7. EyeSpyR is the protection layer — for the consumer, and for the operator who earned the badge.
            {" "}
            <Link to="/transparency" className="text-[color:var(--acid)] underline decoration-[color:var(--acid)]/40 underline-offset-4 hover:decoration-[color:var(--acid)]">See the full scoring rules →</Link>
          </p>
        </div>
      </section>



      {/* Integrity */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow text-center">Integrity</p>
          <h2 className="mt-3 text-center font-display text-4xl font-black uppercase sm:text-5xl">
            Un-<span className="text-[color:var(--acid)]">Riggable</span>
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["No Gating", "Every review — positive or negative — displays. Suppression is disallowed by policy and enforced by architecture."],
              ["PIPEDA Compliant", "Canadian federal privacy law. Lead data stored BC-side, retained 24 months, then purged."],
              ["Anti-Fraud", "Badge issued only after validated credentials, verified location, confirmed exclusive territory, and a live score."],
            ].map(([t, b]) => (
              <div key={t} className="panel p-6">
                <h3 className="font-display text-xl font-bold uppercase text-[color:var(--acid)]">{t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA */}
      <section className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Get Started</p>
          <h2 className="mt-3 font-display text-5xl font-black uppercase sm:text-6xl">
            Claim your <span className="text-[color:var(--acid)]">Territory</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Run your free EyeSpyR scan. See your score, check territory status, and get verified in under 60 seconds.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/scan" className="acid-btn">Run Free Scan</Link>
            <Link to="/pricing" className="ghost-btn">See Pricing</Link>
          </div>
        </div>
      </section>
    <JournalCards/></SiteLayout>
  );
}
