import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import {
  industries,
  credentialChecklist,
  type Industry,
  type Scope,
} from "@/lib/credential-checklist";
import ogImg from "@/assets/og-eyespyr.jpg";
const SITE_URL = "https://eyespyr.com";
const OG_IMAGE = `${SITE_URL}${ogImg}`;
const TITLE = "Business Credential Checklist & Early Access — EyeSpyR";
const DESC =
  "Find the credentials relevant to your industry and location. Prepare your checklist and contact EyeSpyR about early access. Document uploads are not open yet.";
export const Route = createFileRoute("/verify-business")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/verify-business` },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/verify-business` }],
  }),
  component: VerifyBusiness,
});

const inputClass =
  "mt-2 w-full rounded-md border border-border bg-background px-3 py-3 text-base text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-[color:var(--acid)]";
const emptyScope: Scope = {
  workers: false,
  alcohol: false,
  drone: false,
  newHomes: false,
  regulated: false,
};
const recipient = "partnerships@industryarmymarketing.com";
function VerifyBusiness() {
  const [industry, setIndustry] = useState<Industry>("catering");
  const [scope, setScope] = useState<Scope>(emptyScope);
  const [location, setLocation] = useState("bc");
  const [draft, setDraft] = useState("");
  const checklist = credentialChecklist(industry, scope);
  const industryLabel = industries.find(([id]) => id === industry)?.[1];
  function prepare(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = [
      "Hello EyeSpyR, I would like help preparing for business verification.",
      "",
      `Business: ${data.get("business")}`,
      `Contact: ${data.get("contact")}`,
      `Reply email: ${data.get("email")}`,
      `Industry: ${industryLabel}`,
      `Location: ${data.get("city")}, ${location === "bc" ? "British Columbia, Canada" : data.get("region")}`,
      `Website / portfolio: ${data.get("website") || "Not provided"}`,
      "",
      "Checklist readiness:",
      ...checklist.map((item) => `${item.title}: ${data.get(item.id) || "Help me check"}`),
      "",
      "This is an early-access enquiry, not a credential submission. No documents are attached.",
    ].join("\n");
    setDraft(body);
  }
  function toggle(key: keyof Scope) {
    setScope((current) => ({ ...current, [key]: !current[key] }));
    setDraft("");
  }
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Business verification · Early access"
        title="YOUR BUSINESS."
        accent="YOUR CHECKLIST."
        lead="Tell us what you do and where. See the evidence relevant to your business before you gather any paperwork."
      />
      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <div className="panel mb-8 border-[color:var(--acid)] p-6 text-base leading-relaxed">
          <strong>Document uploads are not open yet.</strong> You can prepare a checklist and an
          enquiry now. Nothing is submitted by this form. Secure uploads, credential review and
          badge activation are still being prepared.
        </div>
        <form onSubmit={prepare} onChange={() => setDraft("")} className="space-y-8">
          <fieldset className="panel space-y-5 p-6 sm:p-8">
            <legend className="px-2 text-xl font-bold">1. Your business & location</legend>
            <label className="block">
              Business type
              <select
                className={inputClass}
                value={industry}
                onChange={(e) => {
                  setIndustry(e.target.value as Industry);
                  setScope(emptyScope);
                }}
              >
                {industries.map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                Where do you operate?
                <select
                  className={inputClass}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="bc">British Columbia, Canada</option>
                  <option value="other">Another province, state or country</option>
                </select>
              </label>
              <label>
                City / service area *
                <input
                  className={inputClass}
                  name="city"
                  required
                  maxLength={100}
                  autoComplete="address-level2"
                />
              </label>
            </div>
            {location === "other" && (
              <label className="block">
                Province / state and country *
                <input className={inputClass} name="region" required maxLength={100} />
                <span className="mt-2 block text-sm text-muted-foreground">
                  The team will confirm your local requirements. BC examples below are not a
                  checklist of laws for your location.
                </span>
              </label>
            )}
            <div className="space-y-3">
              <p className="font-semibold">Which activities apply? Select all that fit.</p>
              <Option
                checked={scope.workers}
                onChange={() => toggle("workers")}
                label="We employ workers or use subcontractors"
              />
              {["catering", "events"].includes(industry) && (
                <Option
                  checked={scope.alcohol}
                  onChange={() => toggle("alcohol")}
                  label="We supply or serve alcohol"
                />
              )}
              {["creative", "events"].includes(industry) && (
                <Option
                  checked={scope.drone}
                  onChange={() => toggle("drone")}
                  label="We offer drone services"
                />
              )}
              {industry === "building" && (
                <Option
                  checked={scope.newHomes}
                  onChange={() => toggle("newHomes")}
                  label="We build new homes or undertake building-envelope work"
                />
              )}
              {["plumbing", "building", "other"].includes(industry) && (
                <Option
                  checked={scope.regulated}
                  onChange={() => toggle("regulated")}
                  label="We also perform regulated electrical, gas or similar work"
                />
              )}
            </div>
          </fieldset>
          <fieldset className="panel space-y-5 p-6 sm:p-8">
            <legend className="px-2 text-xl font-bold">2. Your preparation checklist</legend>
            <p className="text-muted-foreground">
              These are evidence categories for review, not a declaration that every document is
              legally required. Requirements depend on your work and location. Selecting “Ready”
              does not verify a credential.
            </p>
            <div aria-live="polite" className="space-y-4">
              {checklist.map((item) => (
                <div key={`${industry}-${item.id}`} className="rounded-md border border-border p-5">
                  <h2 className="text-lg font-bold">{item.title}</h2>
                  <p className="mt-1 text-sm text-[color:var(--acid)]">{item.when}</p>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{item.evidence}</p>
                  {item.source && (
                    <a
                      className="mt-3 inline-block underline underline-offset-4"
                      href={item.source}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Official guidance ↗
                    </a>
                  )}
                  <label className="mt-4 block text-sm">
                    Readiness — {item.title}
                    <select className={inputClass} name={item.id} defaultValue="Help me check">
                      <option>Help me check</option>
                      <option>Ready</option>
                      <option>Need to obtain or renew</option>
                      <option>Not applicable — please review</option>
                    </select>
                  </label>
                </div>
              ))}
            </div>
            <details className="border-t border-border pt-4">
              <summary className="cursor-pointer font-semibold">
                What will the upload step look like?
              </summary>
              <div className="mt-3 space-y-3 text-muted-foreground">
                <p>
                  Once secure uploads open, each relevant credential will have its own card:
                  document type, issuing body, named business or holder, reference, expiry date (or
                  “no expiry”), and a file attachment with replace/remove controls.
                </p>
                <p>
                  You will see the accepted formats and file-size limit before uploading, who can
                  review the document and the retention policy. The future status flow is: received
                  → in review → checked, more information needed, or unable to verify. An expired
                  credential will be labelled separately.
                </p>
                <p>
                  Document files should stay private. A future public status will identify what was
                  checked, the scope and check date. A check is not a guarantee of workmanship, and
                  payment will not make a credential verified.
                </p>
              </div>
            </details>
          </fieldset>
          <fieldset className="panel space-y-5 p-6 sm:p-8">
            <legend className="px-2 text-xl font-bold">3. Prepare an early-access enquiry</legend>
            <p className="text-muted-foreground">
              Required fields are marked *. No payment, territory reservation or document upload is
              involved.
            </p>
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                Business / trading name *
                <input
                  className={inputClass}
                  name="business"
                  required
                  maxLength={150}
                  autoComplete="organization"
                />
              </label>
              <label>
                Your name *
                <input
                  className={inputClass}
                  name="contact"
                  required
                  maxLength={100}
                  autoComplete="name"
                />
              </label>
              <label>
                Reply email *
                <input
                  className={inputClass}
                  name="email"
                  type="email"
                  required
                  maxLength={180}
                  autoComplete="email"
                />
              </label>
              <label>
                Website / public portfolio (optional)
                <input
                  className={inputClass}
                  name="website"
                  maxLength={200}
                  placeholder="example.com"
                />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              Do not include identity documents, tax numbers, financial records or client
              information. This form prepares an email draft on your device; it does not save an
              application or send an email.
            </p>
            <button className="acid-btn w-full justify-center" type="submit">
              Preview my enquiry
            </button>
            {draft && (
              <div
                className="space-y-4 rounded-md border border-[color:var(--acid)] p-5"
                role="status"
              >
                <h2 className="text-xl font-bold">Draft ready — not sent</h2>
                <p>
                  Review the text, then open your email app and send it to{" "}
                  <a className="break-all underline" href={`mailto:${recipient}`}>
                    {recipient}
                  </a>
                  . Colin, the founder, will reply from colin@industryarmymarketing.com.
                </p>
                <label className="block">
                  Your enquiry
                  <textarea readOnly className={inputClass} rows={10} value={draft} />
                </label>
                <a
                  className="acid-btn"
                  href={`mailto:${recipient}?subject=${encodeURIComponent("EyeSpyR early-access enquiry")}&body=${encodeURIComponent(draft)}`}
                >
                  Open email draft
                </a>
                <p className="text-sm text-muted-foreground">
                  No email app? Copy the text above into your webmail. Sending an enquiry does not
                  issue a badge or activate monitoring.
                </p>
              </div>
            )}
          </fieldset>
        </form>
      </section>
    </SiteLayout>
  );
}
function Option({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-1 h-5 w-5 shrink-0 accent-[color:var(--acid)]"
      />
      <span>{label}</span>
    </label>
  );
}
