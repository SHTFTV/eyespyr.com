export type Credential = {
  id: string;
  title: string;
  when: string;
  evidence: string;
  source?: string;
};
export const industries = [
  ["catering", "Catering, food trucks & private chefs"],
  ["creative", "Photography & videography"],
  ["events", "Wedding & event services"],
  ["electrical", "Electrical contracting"],
  ["gas", "Gas fitting & HVAC"],
  ["plumbing", "Plumbing & drainage"],
  ["building", "General contracting, carpentry & renovations"],
  ["snow", "Snow removal & property maintenance"],
  ["landscape", "Landscaping & exterior services"],
  ["cleaning", "Cleaning services"],
  ["other", "Another business type"],
] as const;
export type Industry = (typeof industries)[number][0];
export type Scope = {
  workers: boolean;
  alcohol: boolean;
  drone: boolean;
  newHomes: boolean;
  regulated: boolean;
};
export function credentialChecklist(industry: Industry, scope: Scope): Credential[] {
  const items: Credential[] = [
    {
      id: "identity",
      title: "Business identity",
      when: "For every business",
      evidence:
        "Legal and trading names, business location and a public registry or local business-licence reference where applicable. Sole proprietors can ask about alternative evidence. No tax account, SIN or passport needed at this stage.",
    },
    {
      id: "insurance",
      title: "Business liability insurance",
      when: "Evidence for an insurance claim on your profile",
      evidence:
        "Current certificate showing the named business, covered activities and dates. The team will confirm the relevant scope; a certificate alone does not establish coverage for every job.",
    },
  ];
  if (scope.workers)
    items.push({
      id: "workers",
      title: "Workers’ compensation status",
      when: "If applicable to your workforce and location",
      evidence:
        "Current clearance from your local workers’ compensation authority, or an explanation of your coverage status for review. In BC, use WorkSafeBC clearance rather than a generic registration screenshot.",
      source: "https://www.worksafebc.com/en/insurance/why-clearance-letter/get-clearance-letter",
    });
  if (industry === "catering")
    items.push(
      {
        id: "food",
        title: "Food-service approval or operating permit",
        when: "For the food operation and location you actually use",
        evidence:
          "Relevant health-authority approval or permit, operating address and issuing authority. Include commissary or mobile-unit details when relevant; do not assume a home kitchen is approved.",
        source:
          "https://www.fraserhealth.ca/health-topics-a-to-z/food-safety/requirements-for-food-businesses",
      },
      {
        id: "foodsafe",
        title: "Food-safety training",
        when: "Where required for your operation",
        evidence:
          "FOODSAFE or the locally accepted equivalent, with certificate holder and validity details. A chef qualification is additional evidence, not a substitute for health approval.",
        source: "https://www.fraserhealth.ca/health-topics-a-to-z/food-safety",
      },
    );
  if (scope.alcohol && ["catering", "events"].includes(industry))
    items.push({
      id: "alcohol",
      title: "Alcohol-service authorisation",
      when: "Only if you supply or serve alcohol",
      evidence:
        "Explain who holds the applicable licence or event permit and what service your business provides. Serving qualifications and event permissions are checked separately; requirements depend on the event and location.",
      source:
        "https://www2.gov.bc.ca/gov/content/employment-business/business/liquor-regulation-licensing",
    });
  if (["creative", "events"].includes(industry))
    items.push({
      id: "portfolio",
      title: "Portfolio & service scope",
      when: "Supporting evidence, not a professional licence",
      evidence:
        "Public portfolio links and a description of your services. Share only work you have permission to show. Do not upload client contracts, private footage or identity documents.",
    });
  if (scope.drone && ["creative", "events"].includes(industry))
    items.push({
      id: "drone",
      title: "Drone operating credentials",
      when: "Only for drone services",
      evidence:
        "Aircraft weight/category and operating scope first; then applicable pilot certificate, registration and operation-specific authorisation. Microdrone rules differ. A general photography application does not need a drone certificate.",
      source: "https://tc.canada.ca/en/aviation/drone-safety/drone-pilot-licensing",
    });
  if (["electrical", "gas"].includes(industry) || scope.regulated)
    items.push({
      id: "regulated",
      title: "Licence for regulated work",
      when: "For the specific work and jurisdiction",
      evidence:
        "Contractor licence and relevant individual qualification or responsible-person details. Business licensing and individual trade qualifications are separate. In BC, check electrical and gas scope against Technical Safety BC; a Red Seal alone is not a contractor licence.",
      source: "https://www.technicalsafetybc.ca/regulatory-resources/licensed-contractor-guide",
    });
  if (["plumbing", "building"].includes(industry))
    items.push({
      id: "trade",
      title: "Relevant trade qualifications",
      when: "Where applicable to the work offered",
      evidence:
        "Applicable trade qualification and issuing body, or describe the work and ask the team to confirm the checklist. Do not present a general contractor or carpenter as licensed for every plumbing, gas or electrical task.",
    });
  if (industry === "building" && scope.newHomes)
    items.push({
      id: "builder",
      title: "Residential builder licensing",
      when: "For work that falls within the local licensing rules",
      evidence:
        "Relevant builder licence and project warranty information where applicable. In BC, new-home and certain building-envelope work has specific requirements; this is not a blanket requirement for all carpentry.",
      source: "https://www.bchousing.org/licensing-consumer-services/builder-licensing",
    });
  if (["snow", "landscape", "cleaning"].includes(industry))
    items.push({
      id: "scope",
      title: "Service-specific coverage & training",
      when: "Matched to the services you offer",
      evidence:
        industry === "snow"
          ? "Describe plowing, salting and ice-management work and confirm that your insurance covers those activities. Relevant equipment/operator training can support the review; there is no universal EyeSpyR snow-removal trade ticket."
          : "Describe services, equipment and any specialist activities. Relevant training supports the review; pesticides, hazardous-material work or other regulated services need their own local requirements checked.",
    });
  if (industry === "other")
    items.push({
      id: "review",
      title: "A checklist for your industry",
      when: "Team review needed",
      evidence:
        "Describe what you do and where. We will identify the relevant issuing bodies before requesting any documents. No generic trade ticket requirement.",
    });
  return items;
}
