import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import ogImg from "@/assets/og-how-it-works.jpg";

const SITE_URL = "https://eyespyr.com";
const OG_IMAGE = `${SITE_URL}${ogImg}`;

const HIW_TITLE = "How It Works — EyeSpyR Verification Pipeline";
const HIW_DESC =
  "Prepare an industry-specific credential checklist and enquire about EyeSpyR early access. Secure uploads and badge activation are not yet open.";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: HIW_TITLE },
      { name: "description", content: HIW_DESC },
      { property: "og:title", content: HIW_TITLE },
      { property: "og:description", content: HIW_DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE_URL}/how-it-works` },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: HIW_TITLE },
      { name: "twitter:description", content: HIW_DESC },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/how-it-works` }],
  }),
  component: HowItWorks,
});
const steps = [
  {
    title: "Describe your business",
    body: "Choose your industry, location and activities. Catering, creative services, trades and property services each have a different preparation checklist.",
  },
  {
    title: "Prepare your evidence",
    body: "Review the relevant evidence categories and mark what is ready, missing or not applicable. No documents are uploaded at this stage.",
  },
  {
    title: "Ask about early access",
    body: "Preview an enquiry and send it through your email app. Colin will reply to discuss the appropriate next step. The form itself does not send or store an application.",
  },
  {
    title: "Credential review — coming later",
    body: "Secure document intake and real credential review must be connected before badges are issued. Any future status will identify the evidence checked and its scope. Monitoring and directory membership are separate services.",
  },
];
function HowItWorks() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Early access"
        title="A CLEAR PATH"
        accent="TO VERIFICATION"
        lead="Start with the right checklist. No instant badge, payment or territory commitment."
      />
      <section className="mx-auto max-w-4xl space-y-6 px-5 pb-24 sm:px-8">
        {steps.map((step, i) => (
          <article className="panel p-7" key={step.title}>
            <p className="eyebrow">Step {i + 1}</p>
            <h2 className="mt-2 text-2xl font-bold">{step.title}</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">{step.body}</p>
          </article>
        ))}
        <Link to="/verify-business" className="acid-btn">
          Build my checklist
        </Link>
      </section>
    </SiteLayout>
  );
}
