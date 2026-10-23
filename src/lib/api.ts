// EyeSpyR backend contract — matches api.industryarmymarketing.com spec.
// Override at build time with VITE_EYESPYR_API_URL if needed.
export const API_BASE: string =
  (import.meta.env.VITE_EYESPYR_API_URL as string | undefined) ??
  "https://api.industryarmymarketing.com";

// ------------------------------------------------------------------
// Shared types matching the backend contract
// ------------------------------------------------------------------

export type IntegrityStatus =
  | "received"
  | "identity_check"
  | "verifying"
  | "verified"
  | "weighted"
  | "flagged"
  | "resolved"
  | "logged";

export type EntryType = "receipt" | "credential";

export interface AuditEvent {
  timestamp: string; // ISO
  event: string;
  status: IntegrityStatus;
}

export interface ScoreFactor {
  id: string;
  label: string;
  kind: "credential" | "positive_receipt" | "negative_receipt" | "penalty";
  status: IntegrityStatus;
  weightPct: number; // signed contribution to overall score, e.g. +12.5 or -15
  detail?: string;
  entryId?: string; // deep-link to /entry/{entryId}
}

export interface ScoreBreakdown {
  baseline: number; // starting score before factors, e.g. 50
  total: number; // final score after all factors
  factors: ScoreFactor[];
}

export interface EntryDetail {
  id: string;
  type: EntryType;
  scoreWeightEffect: string; // e.g. "+12.5%" | "-15.0%"
  integrityStatus: IntegrityStatus;
  auditTrail: AuditEvent[];
  // Optional enrichments the API may add
  operator?: string;
  headline?: string;
  starRating?: number;
  reviewText?: string;
  amount?: number;
  invoiceDate?: string;
  scoreBreakdown?: ScoreBreakdown;
}

// ------------------------------------------------------------------
// Allowed status transitions — enforced on the server before emitting
// timeline updates or status-change emails. Frontend uses the same map
// to render the timeline and reject impossible states.
//
//   received → identity_check → verifying → verified | weighted | flagged
//   flagged  → resolved
//   verified | weighted → resolved
// ------------------------------------------------------------------
export const ALLOWED_TRANSITIONS: Record<IntegrityStatus, IntegrityStatus[]> = {
  received: ["identity_check", "verifying", "flagged"],
  identity_check: ["verifying", "flagged"],
  verifying: ["verified", "weighted", "flagged"],
  verified: ["resolved", "flagged"],
  weighted: ["resolved", "flagged"],
  flagged: ["resolved"],
  resolved: [],
  logged: [],
};

export function isAllowedTransition(from: IntegrityStatus, to: IntegrityStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface ReceiptResponse {
  success: boolean;
  referenceId: string;
  status: IntegrityStatus;
  timelineUrl?: string;
}

export interface CredentialResponse {
  success: boolean;
  businessId: string;
  status: IntegrityStatus;
  currentPill?: string;
}

// ------------------------------------------------------------------
// API calls with graceful demo-mode fallback
// ------------------------------------------------------------------

export async function submitReceipt(form: FormData): Promise<ReceiptResponse & { demo?: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/receipts`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as ReceiptResponse;
  } catch {
    return {
      success: true,
      referenceId: "REC-" + randCode(),
      status: "received",
      demo: true,
    };
  }
}

export async function submitCredentials(
  form: FormData,
): Promise<CredentialResponse & { demo?: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/credentials`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as CredentialResponse;
  } catch {
    return {
      success: true,
      businessId: "BIZ-" + randCode(),
      status: "identity_check",
      currentPill: "verifying",
      demo: true,
    };
  }
}

export interface NotifySubscribeResponse {
  success: boolean;
  entryId: string;
  email: string;
  demo?: boolean;
}

/**
 * Opt an email address into status-change notifications for a ledger entry.
 * Backend contract: POST {API_BASE}/api/notify/subscribe
 *   { entryId: string, email: string, events?: IntegrityStatus[] }
 * Server should fire an email on every status transition
 * (received → identity_check → verifying → verified/weighted/flagged → resolved),
 * with a deep link back to https://eyespyr.com/entry/{entryId}.
 */
export async function subscribeToEntryUpdates(
  entryId: string,
  email: string,
): Promise<NotifySubscribeResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/notify/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, email }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as NotifySubscribeResponse;
  } catch {
    return { success: true, entryId, email, demo: true };
  }
}

/**
 * Remove an email from status-change notifications for a ledger entry.
 * Backend contract: POST {API_BASE}/api/notify/unsubscribe
 *   { entryId: string, email: string, token?: string }
 * If `token` is provided (from an email footer one-click link), the server
 * skips the email match and uses the token instead.
 */
export async function unsubscribeFromEntryUpdates(
  entryId: string,
  email: string,
  token?: string,
): Promise<NotifySubscribeResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/notify/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId, email, token }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as NotifySubscribeResponse;
  } catch {
    return { success: true, entryId, email, demo: true };
  }
}

export async function getEntryDetail(id: string): Promise<EntryDetail & { demo?: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/api/entries/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as EntryDetail;
  } catch {
    throw new Error("This business evidence record is unavailable. No verification result has been generated.");
  }
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function randCode(): string {
  return Math.random().toString(36).slice(2, 7).toUpperCase() + "-XM";
}

export function statusColor(status: IntegrityStatus): string {
  switch (status) {
    case "verified":
    case "weighted":
    case "resolved":
      return "var(--acid)";
    case "flagged":
      return "#ff5a3d";
    case "verifying":
    case "identity_check":
      return "#ffd23d";
    default:
      return "color-mix(in oklab, white 55%, transparent)";
  }
}

export function statusLabel(status: IntegrityStatus): string {
  return status.replace(/_/g, " ").toUpperCase();
}

// Demo entry used both by the transparency timeline and the /entry/$id fallback.
export function demoEntry(id: string): EntryDetail {
  const isCredential = id.toUpperCase().startsWith("BIZ");
  if (isCredential) {
    return {
      id,
      type: "credential",
      scoreWeightEffect: "+8.0%",
      integrityStatus: "verified",
      operator: "Cascade Plumbing Ltd.",
      headline: "Red Seal + WCB + Liability — all validated against issuing bodies.",
      auditTrail: [
        { timestamp: "2026-06-04T14:22:00Z", event: "Credential bundle received via operator flow", status: "received" },
        { timestamp: "2026-06-04T14:41:00Z", event: "Identity check completed against BC Registry", status: "identity_check" },
        { timestamp: "2026-06-04T15:03:00Z", event: "Red Seal Plumbing certificate validated against ITA BC registry", status: "verified" },
        { timestamp: "2026-06-04T15:11:00Z", event: "WCB clearance letter — active, no outstanding claims", status: "verified" },
        { timestamp: "2026-06-04T15:22:00Z", event: "Liability insurance certificate confirmed with insurer", status: "verified" },
        { timestamp: "2026-06-04T15:30:00Z", event: "Illustrative evidence review · Plumbing", status: "resolved" },
      ],
      scoreBreakdown: {
        baseline: 50,
        total: 88,
        factors: [
          { id: "cred-redseal", label: "Red Seal Plumbing (ITA BC)", kind: "credential", status: "verified", weightPct: +12, detail: "Certificate #RS-88231 confirmed with issuing body." },
          { id: "cred-wcb", label: "WCB Clearance Letter", kind: "credential", status: "verified", weightPct: +8, detail: "Active, zero outstanding claims." },
          { id: "cred-liability", label: "$2M Liability Insurance", kind: "credential", status: "verified", weightPct: +8, detail: "Verified directly with insurer." },
          { id: "rec-4471", label: "Receipt REC-99281-XM · 5★", kind: "positive_receipt", status: "weighted", weightPct: +6, detail: "OCR line-item match against operator ledger.", entryId: "REC-99281-XM" },
          { id: "rec-3902", label: "Receipt REC-31022-QQ · 2★", kind: "negative_receipt", status: "weighted", weightPct: -4, detail: "Verified negative review — carries equal weight to positive.", entryId: "REC-31022-QQ" },
          { id: "penalty-response", label: "No public response to negative review", kind: "penalty", status: "flagged", weightPct: -2, detail: "Operator has 30 days to respond publicly before penalty clears." },
        ],
      },
    };
  }
  return {
    id,
    type: "receipt",
    scoreWeightEffect: "+12.5%",
    integrityStatus: "weighted",
    operator: "Cascade Plumbing Ltd.",
    starRating: 5,
    amount: 2340,
    invoiceDate: "2026-06-04",
    reviewText:
      "Emergency call at 9pm, on-site in 40 minutes, sourced a rare cartridge, walked me through the whole repair. Fair invoice for after-hours.",
    auditTrail: [
      { timestamp: "2026-07-06T10:45:00Z", event: "Receipt logged via consumer flow", status: "received" },
      { timestamp: "2026-07-06T10:51:00Z", event: "OCR extraction complete — invoice #4471, $2,340.00", status: "verifying" },
      { timestamp: "2026-07-06T11:02:00Z", event: "OCR line-item match completed against operator ledger", status: "weighted" },
      { timestamp: "2026-07-06T11:04:00Z", event: "Weight applied — verified receipt (3× anonymous baseline)", status: "weighted" },
    ],
    scoreBreakdown: {
      baseline: 0,
      total: 12.5,
      factors: [
        { id: "base-star", label: "5★ consumer rating", kind: "positive_receipt", status: "weighted", weightPct: +4, detail: "Base weight for a 5-star anonymous rating." },
        { id: "ocr-match", label: "OCR line-item match", kind: "positive_receipt", status: "verified", weightPct: +6, detail: "Invoice #4471 matched operator ledger exactly." },
        { id: "invoice-amount", label: "Invoice amount above median", kind: "positive_receipt", status: "weighted", weightPct: +2.5, detail: "$2,340 vs. category median $890 — real job, not a token receipt." },
      ],
    },
  };
}

