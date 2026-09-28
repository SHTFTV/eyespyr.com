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
  ["trucking", "Trucking & freight carriers"],
  ["logistics", "Freight brokerage, courier & logistics"],
  ["passenger", "Passenger transport & shuttle services"],
  ["financial", "Financial advisors & financial planners"],
  ["insurance-services", "Insurance agents, brokers & agencies"],
  ["mortgage", "Mortgage brokers & lending services"],
  ["realestate", "Real estate & property management"],
  ["accounting", "Accounting, bookkeeping & tax services"],
  ["legal", "Legal & immigration services"],
  ["health", "Health & wellness services"],
  ["engineering", "Engineering, architecture & design"],
  ["technology", "Technology, consulting & marketing"],
  ["retail", "Retail, manufacturing & product suppliers"],
  ["personal", "Beauty, fitness & personal services"],
  ["other", "Another business type"],
] as const;
export type Industry = (typeof industries)[number][0];
export type Scope = {
  workers: boolean;
  alcohol: boolean;
  drone: boolean;
  newHomes: boolean;
  regulated: boolean;
  dangerousGoods?: boolean;
  usTransport?: boolean;
  investments?: boolean;
  insuranceAdvice?: boolean;
  financialTitles?: boolean;
};
export const industryGroups = [
  { label: "Food, weddings & creative services", ids: ["catering", "creative", "events"] },
  {
    label: "Trades & property services",
    ids: ["electrical", "gas", "plumbing", "building", "snow", "landscape", "cleaning"],
  },
  { label: "Transport & logistics", ids: ["trucking", "logistics", "passenger"] },
  {
    label: "Financial & professional services",
    ids: [
      "financial",
      "insurance-services",
      "mortgage",
      "realestate",
      "accounting",
      "legal",
      "engineering",
    ],
  },
  {
    label: "Health, consumer & business services",
    ids: ["health", "technology", "retail", "personal", "other"],
  },
] as const;
const sectorEvidence: Partial<Record<Industry, Credential[]>> = {
  trucking: [
    {
      id: "carrier",
      title: "Carrier authority & safety status",
      when: "Matched to vehicle type, weight, routes and jurisdiction",
      evidence:
        "Identify the operating carrier, home jurisdiction, fleet types and routes. Prepare the applicable carrier safety certificate or operating authority and public registry reference. In BC, check applicable National Safety Code requirements; a company registration is not operating authority.",
      source: "https://www.cvse.ca/nsc-Course/",
    },
    {
      id: "fleet",
      title: "Vehicle, driver & cargo scope",
      when: "Evidence categories for the operation being reviewed",
      evidence:
        "Describe vehicle inspection status, driver qualification controls, commercial auto coverage and cargo coverage where relevant. Drivers and carriers are checked separately. Do not send driver licence scans, abstracts, medical records, manifests or customer addresses through this enquiry.",
    },
  ],
  logistics: [
    {
      id: "logistics",
      title: "Broker, carrier or courier role",
      when: "Confirm the actual operating role first",
      evidence:
        "State whether you arrange transport, carry goods or both, and where. Broker authority, carrier authority, bonding and insurance requirements can differ. Do not use a subcontracted carrier’s licence as your own. Provide public business references; no shipment manifests or client contracts.",
    },
  ],
  passenger: [
    {
      id: "passenger",
      title: "Passenger-service operating authority",
      when: "According to service, vehicle and location",
      evidence:
        "Describe taxi, charter, shuttle or other service, seating capacity and routes. Prepare the relevant passenger-transport authority, commercial insurance and vehicle/driver qualification categories for local review. Do not send passenger lists or driver personal records.",
    },
  ],
  financial: [
    {
      id: "financial-scope",
      title: "Advisor role, firm & service scope",
      when: "For every financial-services enquiry",
      evidence:
        "Give the individual’s public professional name, firm affiliation, services and jurisdictions. Financial planning, investment advice/dealing, insurance and mortgage services have different requirements. A designation or EyeSpyR status is not permission to sell products, regulatory approval, or an investment recommendation.",
    },
  ],
  "insurance-services": [
    {
      id: "insurance-licence",
      title: "Insurance licence & agency authority",
      when: "For the insurance classes and jurisdictions served",
      evidence:
        "Prepare public licence references for the individual and agency where applicable, permitted classes, current status and agency affiliation. A course-completion certificate alone is not an active licence.",
      source: "https://www.insurancecouncilofbc.com/licensee-directory/",
    },
  ],
  mortgage: [
    {
      id: "mortgage",
      title: "Mortgage role & registration",
      when: "Based on brokerage, agent or lender activity and jurisdiction",
      evidence:
        "Identify the person and firm, public regulator reference, permitted role and service areas. Ask for local review where an exemption is claimed. Do not submit borrower applications, credit reports or bank statements.",
      source: "https://www.bcfsa.ca/public-resources/mortgage-brokers/find-mortgage-broker",
    },
  ],
  realestate: [
    {
      id: "realestate",
      title: "Real-estate service & licence scope",
      when: "According to local trading, rental or strata-management rules",
      evidence:
        "Identify the professional, brokerage, service type and public regulator record. Maintenance services and regulated real-estate management are different activities. Local review is required before selecting evidence; do not send tenant or transaction records.",
    },
  ],
  accounting: [
    {
      id: "accounting",
      title: "Accounting services & professional claims",
      when: "Matched to bookkeeping, tax, accounting or assurance work",
      evidence:
        "List the services and any protected professional title used. Where applicable, prepare individual membership and firm/practice authorisation references from the local regulator. Bookkeeping experience is not automatically an audit or public-practice licence. No client tax returns or financial statements.",
    },
  ],
  legal: [
    {
      id: "legal",
      title: "Legal profession & authorised scope",
      when: "Local regulator review required",
      evidence:
        "Identify lawyer, notary, immigration consultant or other role, practice jurisdiction, firm and public licensing reference. These roles are not interchangeable. Evidence will be matched to the applicable regulator before documents are requested. Do not send client files or privileged communications.",
    },
  ],
  health: [
    {
      id: "health",
      title: "Practitioner, profession & clinic scope",
      when: "Match the exact profession and location",
      evidence:
        "Identify practitioner and clinic, services, protected titles and public professional registration where applicable. Regulated clinical services and non-clinical wellness need different checklists. Do not send patient records, diagnoses or health documents; EyeSpyR does not certify treatment outcomes.",
    },
  ],
  engineering: [
    {
      id: "engineering",
      title: "Professional designation & practice authority",
      when: "For protected titles or regulated professional work",
      evidence:
        "Describe engineering, architecture or design services and location. Prepare applicable individual and firm practice references from the local regulator. A portfolio supports experience but does not replace professional authorisation. No confidential project files.",
    },
  ],
  technology: [
    {
      id: "technology",
      title: "Service scope & claimed certifications",
      when: "Supporting evidence matched to your claims",
      evidence:
        "Describe consulting, software, security, IT or marketing services. Use public portfolio references and issuer-verifiable certifications where claimed. Explain relevant professional liability or cyber coverage. Do not provide credentials, API keys, security reports or client data.",
    },
  ],
  retail: [
    {
      id: "products",
      title: "Products, operating role & regulated activities",
      when: "Supplier, manufacturer or seller requirements vary",
      evidence:
        "Describe product categories, location and whether you manufacture, import or resell. Product certifications, permits and distribution authorisations need product-specific review; business verification does not certify every product. No customer or payment records.",
    },
  ],
  personal: [
    {
      id: "personal",
      title: "Service, training & local permissions",
      when: "Matched to the activity offered",
      evidence:
        "Describe beauty, fitness or personal-care services and any certifications claimed. Premises approvals, professional registration and training vary by activity and location. Medical or invasive services need a separate regulated-health review. No client health or identity records.",
    },
  ],
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
      title: "Relevant business insurance",
      when: "Evidence for an insurance claim on your profile",
      evidence:
        "Current evidence showing the named business or professional, covered activities and dates. Depending on the service, this may include commercial general liability, professional indemnity/errors and omissions, or vehicle/cargo coverage. The team will confirm relevant scope; no single policy covers every service.",
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
  items.push(...(sectorEvidence[industry] ?? []));
  if (["trucking", "logistics", "passenger"].includes(industry) && scope.usTransport)
    items.push({
      id: "us-transport",
      title: "US transport authority",
      when: "Only for relevant US operations",
      evidence:
        "Describe routes and carrier/broker role. Identify applicable USDOT and operating-authority records. Safety information and licensing/insurance authority are separate checks; a USDOT number alone does not prove authority for every service.",
      source: "https://www.fmcsa.dot.gov/safety/company-safety-records",
    });
  if (["trucking", "logistics"].includes(industry) && scope.dangerousGoods)
    items.push({
      id: "dangerous-goods",
      title: "Dangerous-goods scope & training",
      when: "Only where your operation handles or transports these goods",
      evidence:
        "Describe the role, goods classes and jurisdictions. Relevant training certificates and any required authorisations are reviewed separately from ordinary carrier status. In Canada, consult Transport Canada’s TDG requirements.",
      source: "https://tc.canada.ca/en/dangerous-goods/training",
    });
  if (industry === "financial" && scope.investments)
    items.push({
      id: "investments",
      title: "Securities registration & permitted activity",
      when: "For investment advice or securities dealing, as applicable",
      evidence:
        "Provide public registration references for the individual and firm, registration categories and jurisdictions. In Canada, use the CSA National Registration Search and confirm restrictions with the regulator. A planning designation does not substitute for required securities registration.",
      source: "https://www.securities-administrators.ca/investor-tools/are-they-registered/",
    });
  if (industry === "financial" && scope.insuranceAdvice)
    items.push(...(sectorEvidence["insurance-services"] ?? []));
  if (industry === "financial" && scope.financialTitles)
    items.push({
      id: "financial-title",
      title: "Planning designation & title eligibility",
      when: "For each professional title or designation claimed",
      evidence:
        "Identify the credential, issuing body and current public verification reference. Title-use rules vary by jurisdiction; Ontario has an FSRA framework for Financial Planner and Financial Advisor titles. This is separate from permission to advise on or sell specific products.",
      source: "https://www.fsrao.ca/your-financial-planner-advisor-title",
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
