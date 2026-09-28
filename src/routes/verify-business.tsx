import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PageHero } from "@/components/PageHero";
import {
  industries,
  industryGroups,
  credentialChecklist,
  type Industry,
  type Scope,
} from "@/lib/credential-checklist";
import { enquiryDelivery, sendEnquiry } from "@/lib/enquiry.functions";
import ogImg from "@/assets/og-eyespyr.jpg";
const SITE_URL = "https://eyespyr.com";
const OG_IMAGE = `${SITE_URL}${ogImg}`;
const TITLE = "Business Credential Checklist & Early Access — EyeSpyR";
const DESC =
  "Find the credentials relevant to your industry and location. Prepare your checklist and contact EyeSpyR about early access. Document uploads are not open yet.";
export const Route = createFileRoute("/verify-business")({
  loader: () => enquiryDelivery(),
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
  dangerousGoods: false,
  usTransport: false,
  investments: false,
  insuranceAdvice: false,
  financialTitles: false,
};
const recipient = "partnerships@industryarmymarketing.com";
function VerifyBusiness() {
  const [industry, setIndustry] = useState<Industry>("catering");
  const [scope, setScope] = useState<Scope>(emptyScope);
  const [location, setLocation] = useState("bc");
  const { enabled } = Route.useLoaderData();
  const [draft, setDraft] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [requestId, setRequestId] = useState("");
  const [trap, setTrap] = useState("");
  const [delivery, setDelivery] = useState<"idle" | "sending" | "accepted" | "failed">("idle");
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
      `Business description: ${data.get("description")}`,
      `Three keywords: ${[1, 2, 3].map((i) => data.get(`keyword${i}`)).join(", ")}`,
      `Service areas: ${data.get("serviceAreas")}`,
      `Service delivery: ${data.get("serviceMode")}`,
      `Business phone (optional): ${data.get("phone") || "Not provided"}`,
      `Commercial readiness review: ${data.get("commercial") || "Not requested"}`,
      `Additional information: ${data.get("notes") || "None"}`,
      `Services and operating jurisdictions: ${data.get("services")}`,
      `Location: ${data.get("city")}, ${location === "bc" ? "British Columbia, Canada" : data.get("region")}`,
      `Website / portfolio: ${data.get("website") || "Not provided"}`,
      "",
      "Checklist readiness:",
      ...checklist.map((item) => `${item.title}: ${data.get(item.id) || "Help me check"}`),
      "",
      "This is an early-access enquiry, not a credential submission. No documents are attached.",
    ].join("\n");
    setReplyEmail(String(data.get("email")));
    setTrap(String(data.get("websiteExtra") || ""));
    setRequestId(crypto.randomUUID());
    setDelivery("idle");
    setDraft(body);
  }
  async function send() {
    if (delivery === "sending" || delivery === "accepted") return;
    setDelivery("sending");
    try {
      const result = await sendEnquiry({
        data: { email: replyEmail, body: draft, requestId, websiteExtra: trap, consent: true },
      });
      setDelivery(result.accepted ? "accepted" : "failed");
    } catch {
      setDelivery("failed");
    }
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
        accent="YOUR PROFILE."
        lead="Introduce your business, choose three service keywords and tell us where you work. Review your industry checklist, then contact our partnerships team."
      />
      <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
        <div className="panel mb-8 border-[color:var(--acid)] p-6 text-base leading-relaxed">
          <strong>Start with your business profile.</strong>{" "}
          {enabled
            ? "Review your details, then send your enquiry to our partnerships team."
            : "Fill out your details and preview an email to our partnerships team. Direct website sending is being connected; for now, send the prepared draft through your email app."}{" "}
          Secure document uploads and badge activation are not open yet.
        </div>
        <form
          onSubmit={prepare}
          onChange={() => {
            setDraft("");
            setDelivery("idle");
          }}
          className="space-y-8"
        >
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
                {industryGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {industries
                      .filter(([id]) => (group.ids as readonly string[]).includes(id))
                      .map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                  </optgroup>
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
                Business base / city *
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
                  The team will confirm your local requirements. Jurisdiction-specific examples
                  below are not a checklist of laws for other locations.
                </span>
              </label>
            )}
            <label className="block">
              Business description *
              <textarea
                className={inputClass}
                name="description"
                required
                rows={4}
                maxLength={1200}
                placeholder="Tell us what your business does, who you help and what makes your approach different."
              />
            </label>
            <div>
              <p className="font-semibold">Your three service keywords *</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use a service or short phrase for each, such as drain cleaning, wedding catering or
                freight hauling.
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <label key={i}>
                    Keyword {i} *
                    <input className={inputClass} name={`keyword${i}`} required maxLength={60} />
                  </label>
                ))}
              </div>
            </div>
            <label className="block">
              Service areas *
              <textarea
                className={inputClass}
                name="serviceAreas"
                required
                rows={2}
                maxLength={500}
                placeholder="Cities, neighbourhoods, regions or routes you serve. Include any travel radius or remote coverage."
              />
            </label>
            <label className="block">
              How do you serve customers?
              <select className={inputClass} name="serviceMode">
                <option>At the customer’s location</option>
                <option>At our business premises</option>
                <option>Online / remote</option>
                <option>Transport routes / delivery</option>
                <option>A combination — described below</option>
              </select>
            </label>
            <label className="block">
              Services and operating jurisdictions *
              <textarea
                className={inputClass}
                name="services"
                required
                rows={3}
                maxLength={500}
                placeholder="What services do you offer, and in which provinces, states or countries?"
              />
            </label>
            <p className="text-sm text-muted-foreground">
              Describe business activities only. Do not include client, patient, investor, borrower
              or driver personal records. Checklists are preparation guides; the relevant regulator
              determines legal authorisation.
            </p>
            <div className="space-y-3">
              {["trucking", "logistics", "passenger"].includes(industry) && (
                <Option
                  checked={!!scope.usTransport}
                  onChange={() => toggle("usTransport")}
                  label="We operate or arrange transport in the United States"
                />
              )}
              {["trucking", "logistics"].includes(industry) && (
                <Option
                  checked={!!scope.dangerousGoods}
                  onChange={() => toggle("dangerousGoods")}
                  label="We handle, arrange or transport dangerous goods"
                />
              )}
              {industry === "financial" && (
                <>
                  <Option
                    checked={!!scope.investments}
                    onChange={() => toggle("investments")}
                    label="We offer investment advice or deal in securities"
                  />
                  <Option
                    checked={!!scope.insuranceAdvice}
                    onChange={() => toggle("insuranceAdvice")}
                    label="We advise on or sell insurance products"
                  />
                  <Option
                    checked={!!scope.financialTitles}
                    onChange={() => toggle("financialTitles")}
                    label="We use a financial advisor/planner title or professional designation"
                  />
                </>
              )}
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
            <legend className="px-2 text-xl font-bold">3. Contact & review</legend>
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
            <label className="block">
              Business phone (optional)
              <input
                className={inputClass}
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={50}
              />
            </label>
            <label className="block">
              Commercial readiness (optional)
              <select className={inputClass} name="commercial">
                <option>Not requested</option>
                <option>
                  I would like help with bonding, supplier references or commercial insurance
                  evidence
                </option>
                <option>
                  I would like help with carrier authority, cargo insurance or transport evidence
                </option>
                <option>Please help me choose the relevant evidence</option>
              </select>
            </label>
            <label className="block">
              Anything else we should know? (optional)
              <textarea className={inputClass} name="notes" rows={3} maxLength={1000} />
            </label>
            <div hidden aria-hidden="true">
              <label>
                Leave this blank
                <input name="websiteExtra" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              Business information only. Do not include identity documents, tax numbers, financial
              records or client information. An enquiry does not create a public listing or verify
              your business.
            </p>
            <label className="flex items-start gap-3">
              <input type="checkbox" required name="consent" className="mt-1 h-5 w-5 shrink-0" />
              <span>
                I agree to share these details with Industry Army Marketing’s partnerships team for
                this enquiry and to be contacted about it. This is not a newsletter signup.
              </span>
            </label>
            <button className="acid-btn w-full justify-center" type="submit">
              Preview my enquiry
            </button>
            {draft && (
              <div
                className="space-y-4 rounded-md border border-[color:var(--acid)] p-5"
                role="status"
              >
                <h2 className="text-xl font-bold">
                  {delivery === "accepted"
                    ? "Enquiry accepted for email delivery"
                    : "Review your enquiry — not sent"}
                </h2>
                <p>
                  {enabled
                    ? "Send your reviewed enquiry to "
                    : "Open your email app and send your reviewed enquiry to "}
                  <a className="break-all underline" href={`mailto:${recipient}`}>
                    {recipient}
                  </a>
                  . Colin, the founder, will reply from colin@industryarmymarketing.com.
                </p>
                <label className="block">
                  Your enquiry
                  <textarea readOnly className={inputClass} rows={10} value={draft} />
                </label>
                {enabled && (
                  <button
                    type="button"
                    className="acid-btn"
                    disabled={delivery === "sending" || delivery === "accepted"}
                    onClick={send}
                  >
                    {delivery === "sending"
                      ? "Sending…"
                      : delivery === "accepted"
                        ? "Accepted for delivery"
                        : "Send to partnerships"}
                  </button>
                )}
                {delivery === "accepted" && (
                  <p>
                    Your email provider submission was accepted. This is not confirmation of inbox
                    delivery or business verification.
                  </p>
                )}
                {delivery === "failed" && (
                  <p role="alert">
                    We could not confirm sending. Your details are still here. Retry or send the
                    email draft below.
                  </p>
                )}
                {delivery !== "accepted" && (
                  <a
                    className="acid-btn"
                    href={`mailto:${recipient}?subject=${encodeURIComponent("EyeSpyR early-access enquiry")}&body=${encodeURIComponent(draft)}`}
                  >
                    Open email draft
                  </a>
                )}
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
