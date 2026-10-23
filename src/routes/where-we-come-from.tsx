import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";

const SITE_URL = "https://eyespyr.com";
const IAM_ORG = "https://industryarmymarketing.com/#organization";

const TITLE = "Where We Come From — The 20-Year Startup | EyeSpyR";
const DESC =
  "Twenty years running small businesses and doing their online marketing. One year building the thing it was all leading to. EyeSpyR and Industry Army Marketing's origin story — pre-money, gates closed, looking for the businesses who love what they do.";

const explore = [
  { to: "/trust-layer", label: "The Trust Layer" },
  { to: "/network", label: "Industries" },
  { to: "/verify-business", label: "Prepare a Check" },
] as const;

export const Route = createFileRoute("/where-we-come-from")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE_URL}/where-we-come-from` },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/where-we-come-from` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "@id": `${SITE_URL}/where-we-come-from#webpage`,
          url: `${SITE_URL}/where-we-come-from`,
          name: TITLE,
          description: DESC,
          isPartOf: { "@id": "https://eyespyr.com/#website" },
          about: { "@id": IAM_ORG },
          publisher: { "@id": IAM_ORG },
        }),
      },
    ],
  }),
  component: Story,
});

function Story() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Where We Come From"
        title="THE 20-YEAR"
        accent="STARTUP"
        lead="Twenty years in the making. One year in the building. This is the part that isn't on the pitch deck."
      />

      <article className="mx-auto max-w-2xl px-5 py-20 text-base leading-relaxed text-muted-foreground sm:px-8 sm:text-lg">
        <p className="mb-6 text-lg text-foreground sm:text-xl">EyeSpyR is a standalone business registration and credential-check service. Its focus is checkable business identity and evidence-led professional expertise, starting with contractors.</p>
        <p className="text-lg text-foreground sm:text-xl">
          Before any of this was a platform, it was a job. Two decades of running small
          businesses &mdash; and doing the online marketing for them, and for a few select
          clients who trusted us with theirs.
        </p>

        <p className="mt-6">
          Industry Army Marketing has been in the SEO and marketing business quietly for
          years. Not loud. Not funded. Just working. In that time we became something you
          only notice in hindsight: a collection of domains. Some grew into real strength.
          Some sat dormant &mdash; parked through years of hacks, rebuilds, and the ordinary
          ups and downs that come with actually living a life while you build one.
        </p>

        <p className="mt-6">
          Through all of it, the dream never changed: to build the best directory network in
          the world for small-business technology. A place where the operator who is great at
          what they do &mdash; and quiet about it &mdash; finally gets the tools to be found,
          trusted, and understood by the machines that now decide who gets seen.
        </p>

        <div className="my-12 border-l-2 border-[color:var(--acid)] pl-6">
          <p className="font-display text-2xl font-black uppercase leading-tight text-foreground sm:text-3xl">
            You can&rsquo;t fake twenty years.
          </p>
          <p className="mt-3 text-sm">
            The history is the point. It&rsquo;s the same reason the whole thing is built on
            verified provenance &mdash; the record you can&rsquo;t rewind and can&rsquo;t buy.
          </p>
        </div>

        <p>
          So here we are. Pre-money. No gateways open yet. Sitting still for a moment, looking
          around, and deciding &mdash; on purpose &mdash; to open slowly and to the right
          people first.
        </p>

        <p className="mt-6">
          We&rsquo;re not looking for everyone. We&rsquo;re looking for the businesses who
          genuinely love what they do and want to tell the world about it. The ones worth
          verifying. The ones worth building around.
        </p>

        <p className="mt-8 font-display text-xl font-black uppercase text-foreground">
          We&rsquo;re looking for you.
        </p>
      </article>

      <section className="border-t border-border/60 px-5 py-16 sm:px-8">
        <p className="eyebrow text-center">Keep Reading</p>
        <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
          {explore.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="panel flex items-center justify-between p-5 text-sm font-medium transition-colors hover:text-[color:var(--acid)]"
            >
              {l.label}
              <span className="text-[color:var(--acid)]">&rarr;</span>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
