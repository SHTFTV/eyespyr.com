export const reviewSteps = [
  { id: 'profile', title: 'Your profile, ready to check', detail: 'Receive your own page card and confirm the business name, real operating address, service areas and contact person.' },
  { id: 'invite', title: 'An invitation made for your business', detail: 'Open a private, expiring invitation. Confirm you represent the business before accessing its evidence request.' },
  { id: 'evidence', title: 'One clear evidence checklist', detail: 'Provide the registration, insurance, relevant certificates and proof of work requested for your trade. Each item has its own issuer, scope and dates.' },
  { id: 'vault', title: 'Originals stay in the private vault', detail: 'Documents belong to the business record. The business and authorised EyeSpyR reviewers can access them; public profiles show only approved summaries.' },
  { id: 'compare', title: 'Match the details. Explain the differences.', detail: 'Review names, registration or certificate references, dates, service scope and issuing organisations. Differences become questions for review, not automatic accusations.' },
  { id: 'decision', title: 'A review with a visible reason', detail: 'A reviewer checks the evidence and any responses, records the outcome and its date, and publishes only the facts approved for the public profile. Five Eyes is not guaranteed by uploading.' },
] as const;
export const evidenceCategories = [
  ['Business identity', 'Legal and trading names, business registration and public registry reference.'],
  ['Insurance', 'Certificate, named insured, issuer, covered work, effective period and expiry.'],
  ['Qualifications', 'Relevant trade licences, professional credentials and issuing-body references.'],
  ['Safety standing', 'Workers’ compensation or relevant safety-board record where applicable.'],
  ['Proof of work', 'Permission-cleared project examples, scope and completion records.'],
] as const;
export const comparisonChecks = [
  ['Business name', 'Compare legal entity, trading name and named insured. Record an explained trading-name difference rather than treating it as a failed match.'],
  ['References & dates', 'Compare credential identifiers, issuer, issue date, effective dates and expiry. A newly uploaded file does not renew an expired credential.'],
  ['Scope & location', 'Check the work and jurisdiction covered. A service area does not become a registered office or shop address.'],
  ['Document patterns', 'Shared issuer layouts and templates can be normal. Similarity, formatting changes or OCR uncertainty trigger a reviewer’s question; they do not establish authenticity or wrongdoing.'],
  ['Conflicts & corrections', 'Keep both versions, the source and the business response. Verify material discrepancies with the issuer where appropriate and authorised.'],
] as const;
export type ReviewState = 'profile_ready' | 'invitation_queued' | 'invited' | 'collecting' | 'submitted' | 'in_review' | 'needs_information' | 'decision_ready' | 'published';
const transitions:Record<ReviewState,readonly ReviewState[]> = {
 profile_ready:['invitation_queued'], invitation_queued:['invited'], invited:['collecting'], collecting:['submitted'], submitted:['in_review'], in_review:['needs_information','decision_ready'], needs_information:['collecting','in_review'], decision_ready:['in_review','published'], published:['in_review'],
};
export function canTransition(from:ReviewState,to:ReviewState){return transitions[from].includes(to);}
export function reviewInvitation(business:{name:string;profileUrl:string;reviewUrl?:string}){
 return {subject:`${business.name}: your EyeSpyR profile and next steps`,body:`Hi,\n\nYour ${business.name} profile is ready to look over:\n${business.profileUrl}\n\nYou’re a few steps from your Five Eyes review. First, check the business details, then provide the credentials and certificates relevant to your work through your private evidence invitation.\n\n${business.reviewUrl ? `Open your private invitation: ${business.reviewUrl}` : 'We’ll send your private evidence invitation when the vault is ready. Please don’t reply with private documents yet.'}\n\nWe’ll compare the names, issuing organisations, scope and dates, and ask you to clarify anything that differs. Uploading starts the review; a Five Eyes outcome depends on the evidence and reviewer decision.\n\nYour original documents stay private. Only approved verification summaries belong on your public profile.\n\nEyeSpyR`};
}
export type EvidenceRecord={businessId:string;entityName:string;issuer:string;reference?:string;validFrom?:string;expiresOn?:string;scope:string;sha256?:string};
export type EvidenceFinding={field:string;status:'matches'|'clarify'|'expired'|'not_checked';note:string};
export function compareEvidence(businessId:string,records:EvidenceRecord[],asOf:string):EvidenceFinding[]{
 if(records.some(r=>r.businessId!==businessId))throw new Error('Evidence is outside this business review.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(asOf)||Number.isNaN(Date.parse(asOf)))throw new Error('A review date is required.');
 const normal=(s:string)=>s.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('en-CA');
 const names=new Set(records.map(r=>normal(r.entityName)).filter(Boolean));
 const findings:EvidenceFinding[]=[{field:'entity_name',status:names.size>1?'clarify':names.size===1?'matches':'not_checked',note:names.size>1?'Names differ. Ask whether this is an authorised trading name, another entity or a transcription error.':'Matching supplied text is not independent identity verification.'}];
 for(const r of records){
  if(!r.issuer.trim()||!r.reference?.trim())findings.push({field:'issuer_reference',status:'not_checked',note:'Issuer or reference is missing; obtain a checkable source.'});
  if(r.expiresOn){if(!/^\d{4}-\d{2}-\d{2}$/.test(r.expiresOn)||Number.isNaN(Date.parse(r.expiresOn)))findings.push({field:'expiry',status:'clarify',note:'Expiry date could not be read reliably.'});else if(r.expiresOn<asOf)findings.push({field:'expiry',status:'expired',note:'The supplied expiry precedes the review date. Request a current record or issuer clarification.'});}
  if(r.validFrom&&r.validFrom>asOf)findings.push({field:'effective_date',status:'clarify',note:'The record is future-dated relative to this review.'});
  if(!r.scope.trim())findings.push({field:'scope',status:'not_checked',note:'Covered work or professional scope is missing.'});
 }
 const hashes=records.map(r=>r.sha256).filter(Boolean);if(new Set(hashes).size<hashes.length)findings.push({field:'duplicate_file',status:'clarify',note:'The same file was supplied more than once. It is one source, not independent corroboration.'});
 return findings;
}
