import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { HeroBanner } from "@/components/HeroBanner";
import heroAsset from "@/assets/eyespyr-hero-banner.png.asset.json";
import ogImg from "@/assets/og-eyespyr.jpg";
import {
  IAM_TARGET_URL,
  blastUtmUrl,
  trackEvent,
  type BlastChannel,
} from "@/lib/analytics";

const SITE_URL = "https://eyespyr.com";
const CANONICAL = `${SITE_URL}/talc-tv`;
const OG_IMAGE = `${SITE_URL}${ogImg}`;
const DEMO_ENTRY_PATH = "/entry/demo";
const DESC =
  "TALC.tv — the EyeSpyR social blast engine. Verified trade wins broadcast to TikTok, Instagram, YouTube Shorts, X, and LinkedIn the moment a score moves. Real receipts, real reviews, dofollow backlinks, guest-post syndication.";

export const Route = createFileRoute("/talc-tv")({
  head: () => ({
    meta: [
      { title: "TALC.tv Blast — Verified Trade Wins to Every Feed | EyeSpyR" },
      { name: "description", content: DESC },
      {
        name: "keywords",
        content:
          "verified contractor social media, trade review syndication, dofollow backlinks contractors, guest post SEO trades, TikTok trade wins, social proof verification, EyeSpyR blast, IAM contractor marketing",
      },
      { property: "og:title", content: "TALC.tv Blast — Broadcast Verified Trade Wins" },
      { property: "og:description", content: DESC },
      { property: "og:site_name", content: "EyeSpyR" },
      { property: "og:type", content: "article" },
      { property: "og:url", content: CANONICAL },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:secure_url", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "TALC.tv — verified trade blast on every social feed" },
      { property: "og:locale", content: "en_CA" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@eyespyr" },
      { name: "twitter:creator", content: "@eyespyr" },
      { name: "twitter:title", content: "TALC.tv Blast — Broadcast Verified Trade Wins" },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:image:alt", content: "TALC.tv verified trade blast" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "TALC.tv Verified Trade Blast",
          provider: { "@type": "Organization", name: "EyeSpyR", url: "https://eyespyr.com" },
          serviceType: "Verified social syndication and guest-post SEO",
          areaServed: "Canada",
          description: DESC,
          url: CANONICAL,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is TALC.tv?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "TALC.tv is EyeSpyR's verified-content blast channel. Every time a contractor's score moves, the win is auto-cut into short-form video and pushed to TikTok, Instagram Reels, YouTube Shorts, X, and LinkedIn with a dofollow link back to the operator's public ledger page.",
              },
            },
            {
              "@type": "Question",
              name: "Are the guest-post backlinks dofollow?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Every TALC.tv guest-post placement carries a dofollow rel attribute passing authority to the operator's ledger URL.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: TalcTvPage,
});

interface ChannelDef {
  tag: string;
  name: string;
  meta: string;
  note: string;
  channel: BlastChannel;
  href: string;
}

const channels: ChannelDef[] = [
  {
    tag: "01",
    name: "TikTok",
    meta: "Short-form vertical · 15–45s cuts",
    note: "Verified win → auto-caption → hashtag stack tied to trade + region.",
    channel: "tiktok",
    href: "https://www.tiktok.com/@eyespyr",
  },
  {
    tag: "02",
    name: "Instagram Reels",
    meta: "Vertical · 30–60s",
    note: "Cross-post from TikTok, extra carousel breakdown of the score move.",
    channel: "instagram",
    href: "https://www.instagram.com/eyespyr",
  },
  {
    tag: "03",
    name: "YouTube Shorts",
    meta: "Vertical · 60s max",
    note: "Dofollow description link back to /entry/{id} ledger page.",
    channel: "youtube-shorts",
    href: "https://www.youtube.com/@eyespyr",
  },
  {
    tag: "04",
    name: "X (Twitter)",
    meta: "Native video + thread",
    note: "Score-move alert thread with public audit-trail permalink.",
    channel: "x",
    href: "https://x.com/eyespyr",
  },
  {
    tag: "05",
    name: "LinkedIn",
    meta: "Native video + article",
    note: "Operator brand-authority push to B2B decision makers.",
    channel: "linkedin",
    href: "https://www.linkedin.com/company/eyespyr",
  },
];

interface GuestPost {
  slot: string;
  outlet: string;
  payload: string;
  keywords: string[];
  channel: BlastChannel;
  href: string;
}

const guestPosts: GuestPost[] = [
  {
    slot: "Guest Post 01",
    outlet: "Regional Trade Journal (category-matched)",
    payload:
      "1,200-word case study framed around the operator's verified win, embedded score badge, one dofollow link to /entry/{id} and one to eyespyr.com.",
    keywords: [
      "verified [trade] contractor [city]",
      "licensed [trade] with real reviews",
      "how to verify a [trade] before hiring",
    ],
    channel: "guest-post-trade-journal",
    href: `${IAM_TARGET_URL}/press/trade-journal`,
  },
  {
    slot: "Guest Post 02",
    outlet: "Category review / directory site",
    payload:
      "Author-bio placement with dofollow link, plus in-body citation to the EyeSpyR public ledger as the proof source.",
    keywords: [
      "best [trade] near me verified",
      "trade contractor background check",
      "consumer receipt verification service",
    ],
    channel: "guest-post-directory",
    href: `${IAM_TARGET_URL}/press/directory`,
  },
  {
    slot: "Guest Post 03",
    outlet: "Regional business / news publication",
    payload:
      "Op-ed or contributor piece under the operator's name on trust in the trades, published with dofollow author link + operator citation.",
    keywords: [
      "trust standard trades industry",
      "how consumers verify contractors",
      "PIPEDA-compliant review platform",
    ],
    channel: "guest-post-oped",
    href: `${IAM_TARGET_URL}/press/op-ed`,
  },
];

function TalcTvPage() {
  return (
    <SiteLayout>
      <HeroBanner
        image={heroAsset.url}
        imageAlt="TALC.tv — EyeSpyR verified trade blast"
        href={IAM_TARGET_URL}
        hrefLabel="Visit Industry Army Marketing"
        onHrefClick={() =>
          trackEvent({ name: "hero_outbound_click", url: IAM_TARGET_URL, page: "/talc-tv" })
        }
        caption="Verified trade wins broadcast to every feed the moment your score moves — every link dofollow to your public ledger."
      >
        <Link to="/verify-business" className="acid-btn">Enroll My Business</Link>
        <Link to="/transparency" className="ghost-btn">See Score Rules</Link>
      </HeroBanner>

      {/* Live blast targets — dofollow + UTM tagged */}
      <section className="mx-auto max-w-4xl px-5 pb-8 pt-2 sm:px-8">
        <div className="rounded-xl border border-border/60 bg-[color:var(--surface)]/40 p-5">
          <p className="mono-label text-center text-[color:var(--acid)]">Live Blast Targets · dofollow</p>
          <ul className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            {channels.map((c) => (
              <li key={c.channel}>
                <a
                  href={blastUtmUrl(DEMO_ENTRY_PATH, c.channel)}
                  rel="dofollow noopener"
                  target="_blank"
                  onClick={() =>
                    trackEvent({
                      name: "blast_click",
                      channel: c.channel,
                      url: blastUtmUrl(DEMO_ENTRY_PATH, c.channel),
                      entryPath: DEMO_ENTRY_PATH,
                    })
                  }
                  className="inline-block rounded-full border border-border/60 px-3 py-1 uppercase tracking-wide hover:border-[color:var(--acid)] hover:text-[color:var(--acid)]"
                >
                  {c.name}
                </a>
              </li>
            ))}
            {guestPosts.map((g) => (
              <li key={g.channel}>
                <a
                  href={g.href}
                  rel="dofollow noopener"
                  target="_blank"
                  onClick={() =>
                    trackEvent({ name: "guest_post_click", channel: g.channel, url: g.href })
                  }
                  className="inline-block rounded-full border border-[color:var(--acid)]/60 px-3 py-1 uppercase tracking-wide text-[color:var(--acid)] hover:bg-[color:var(--acid)]/10"
                >
                  {g.slot}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What TALC.tv is */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <p className="eyebrow">What TALC.tv Is</p>
        <h2 className="mt-2 font-display text-3xl font-black uppercase">
          The <span className="text-[color:var(--acid)]">signal amplifier</span> for verified trade wins
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Every time a score moves on your EyeSpyR ledger — a new 5★ verified receipt, a fresh
          Red Seal, a resolved dispute — TALC.tv auto-cuts the event into short-form video and
          syndicates it across social channels with a permanent, dofollow link back to the
          public entry. Your win becomes your marketing, and your marketing becomes indexable
          search authority.
        </p>
      </section>

      {/* Channels */}
      <section className="border-y border-border/60 bg-[color:var(--surface)]/30 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="eyebrow">The Blast Stack</p>
          <h2 className="mt-2 font-display text-3xl font-black uppercase">
            Five feeds, <span className="text-[color:var(--acid)]">one trigger</span>
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((c) => {
              const utmHref = blastUtmUrl(DEMO_ENTRY_PATH, c.channel);
              return (
                <div key={c.name} className="panel p-6">
                  <p className="mono-label text-[color:var(--acid)]">{c.tag}</p>
                  <h3 className="mt-2 font-display text-xl font-black uppercase">{c.name}</h3>
                  <p className="mono-label mt-1 text-muted-foreground">{c.meta}</p>
                  <p className="mt-3 text-sm text-foreground/90">{c.note}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs">
                    <a
                      href={c.href}
                      rel="dofollow noopener"
                      target="_blank"
                      onClick={() =>
                        trackEvent({ name: "blast_click", channel: c.channel, url: c.href })
                      }
                      className="text-[color:var(--acid)] underline underline-offset-4"
                    >
                      Channel →
                    </a>
                    <a
                      href={utmHref}
                      rel="dofollow noopener"
                      target="_blank"
                      onClick={() =>
                        trackEvent({
                          name: "blast_click",
                          channel: c.channel,
                          url: utmHref,
                          entryPath: DEMO_ENTRY_PATH,
                        })
                      }
                      className="text-foreground/80 underline underline-offset-4"
                    >
                      Sample blast link (UTM tagged)
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Guest post blast */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <p className="eyebrow">Guest-Post Blast</p>
        <h2 className="mt-2 font-display text-3xl font-black uppercase">
          Three dofollow placements <span className="text-[color:var(--acid)]">every quarter</span>
        </h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          We syndicate one case study, one directory citation, and one contributor op-ed per
          quarter to publications relevant to your trade and service area. Every placement carries a
          dofollow link back to your EyeSpyR ledger and a citation to eyespyr.com.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {guestPosts.map((g) => (
            <article key={g.slot} className="panel flex flex-col gap-3 p-6">
              <p className="mono-label text-[color:var(--acid)]">{g.slot}</p>
              <h3 className="font-display text-lg font-black uppercase">{g.outlet}</h3>
              <p className="text-sm text-foreground/90">{g.payload}</p>
              <div className="mt-2 border-t border-border/60 pt-3">
                <p className="mono-label mb-2 text-muted-foreground">Target Keywords</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {g.keywords.map((k) => (
                    <li key={k}>· {k}</li>
                  ))}
                </ul>
              </div>
              <a
                href={g.href}
                rel="dofollow noopener"
                target="_blank"
                onClick={() =>
                  trackEvent({ name: "guest_post_click", channel: g.channel, url: g.href })
                }
                className="mt-2 inline-block text-xs text-[color:var(--acid)] underline underline-offset-4"
              >
                Visit placement target →
              </a>
            </article>
          ))}
        </div>
      </section>

      {/* SEO explainer */}
      <section className="border-t border-border/60 bg-[color:var(--surface)]/30 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="eyebrow">Why This Works for SEO</p>
          <h2 className="mt-2 font-display text-3xl font-black uppercase">
            Verified content <span className="text-[color:var(--acid)]">outranks</span> paid content
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/90">
            <li>
              <strong className="text-[color:var(--acid)]">Dofollow authority:</strong> Every guest
              post placement passes link equity directly to your public ledger page.
            </li>
            <li>
              <strong className="text-[color:var(--acid)]">UTM measurement:</strong> Every blast
              link is tagged (utm_source, utm_medium=social/referral, utm_campaign=talc_tv_blast)
              so you can measure which channel drives visits to each /entry page.
            </li>
            <li>
              <strong className="text-[color:var(--acid)]">Branded search lift:</strong> Social
              blasts drive queries like "your business name reviews" and "your business name
              verified" — the strongest signal Google uses for local trust.
            </li>
            <li>
              <strong className="text-[color:var(--acid)]">Un-riggable proof:</strong> Because every
              blast links to a public audit trail on the EyeSpyR ledger, the content survives
              scrutiny.
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <p className="eyebrow">Ready to broadcast?</p>
        <h2 className="mt-2 font-display text-4xl font-black uppercase">
          Turn your next win into <span className="text-[color:var(--acid)]">indexed authority</span>
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/verify-business" className="acid-btn">Enroll My Business</Link>
          <Link to="/pricing" className="ghost-btn">See Pricing</Link>
        </div>
      </section>
    </SiteLayout>
  );
}
