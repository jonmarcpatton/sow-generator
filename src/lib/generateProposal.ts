import rateCard from "../../rate-card.json";
import terms from "../../terms.json";
import type { ProposalData, ScopeItem, ScopeOfWork } from "./types";

export type RateCardItem = {
  id: string;
  name: string;
  oneTimeFee?: number;
  annualFee?: number;
  monthlyFee?: number;
  commitmentMonths?: number;
  unit?: string;
  description: string;
  travelBilledSeparately?: boolean;
};

export const integrationIds = new Set(rateCard.integrations.map((item) => item.id));

export const catalog: RateCardItem[] = [
  ...rateCard.integrations,
  ...rateCard.professionalServices,
];

/**
 * Stubbed placeholder prose per rate-card line item, explaining why it was
 * selected for this customer. Swap for AI-generated copy later.
 */
const ITEM_BLURBS: Record<string, string> = {
  salesforce:
    "Gives your team real-time visibility into account data and automates escalation routing.",
  slack:
    "Surfaces platform notifications and workflows directly in the Slack channels your team already uses.",
  jira:
    "Automatically creates and routes engineering tickets so nothing falls through the cracks.",
  training:
    "A full day of hands-on training so your team is confident using the new tools from day one.",
  consulting:
    "Three days of dedicated consulting to configure the engagement and align it with your workflows.",
  enterprise_support:
    "Ongoing dedicated support to keep the engagement running smoothly after go-live.",
};

export function toScopeItem(id: string): ScopeItem {
  const raw = catalog.find((item) => item.id === id);
  if (!raw) {
    throw new Error(`Unknown rate card line item: ${id}`);
  }

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    category: integrationIds.has(raw.id) ? "integration" : "professionalService",
    oneTimeFee: raw.oneTimeFee ?? 0,
    annualFee: raw.annualFee ?? 0,
    monthlyFee: raw.monthlyFee,
    commitmentMonths: raw.commitmentMonths,
    travelBilledSeparately: raw.travelBilledSeparately,
    blurb: ITEM_BLURBS[raw.id] ?? "Included as part of this engagement.",
  };
}

export function buildScopeOfWork(itemIds: string[]): ScopeOfWork {
  const items = itemIds.map(toScopeItem);

  return {
    items,
    totalOneTime: items.reduce((sum, item) => sum + item.oneTimeFee, 0),
    totalAnnual: items.reduce((sum, item) => sum + item.annualFee, 0),
    monthlyCommitments: items
      .filter((item): item is ScopeItem & { monthlyFee: number } => Boolean(item.monthlyFee))
      .map((item) => ({
        name: item.name,
        monthlyFee: item.monthlyFee,
        commitmentMonths: item.commitmentMonths ?? 12,
      })),
  };
}

/** Strips a leading "Discovery Call Notes:" (or similar) label so it never leaks into the client name. */
export function extractClientName(notes: string): string {
  const lines = notes
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    const stripped = line
      .replace(/^discovery\s*(call)?\s*notes\s*[:\-–]?\s*/i, "")
      .trim();
    if (stripped) return stripped.slice(0, 60);
  }

  return "Your Organization";
}

/**
 * STUB — proposal generation.
 *
 * This does not call an AI model or any external API. It returns a fixed
 * scope of work assembled from real line items in rate-card.json (the item
 * selection below — Salesforce Integration + Consulting Package + Training
 * Package — is the one hardcoded assumption in this stub, standing in for
 * what a real generation call would tailor to the customer) and appends
 * terms.json verbatim. Swap the body of this function for a real generation
 * call later — the input/output shape can stay the same, so callers don't
 * need to change.
 */
export function generateProposalStub(notes: string): ProposalData {
  const clientName = extractClientName(notes);

  const preparedOn = new Date();
  const validUntilDate = new Date(preparedOn);
  validUntilDate.setDate(validUntilDate.getDate() + 30);

  const dateFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const referenceNumber = `SOW-${preparedOn.getFullYear()}${String(
    preparedOn.getMonth() + 1,
  ).padStart(2, "0")}${String(preparedOn.getDate()).padStart(2, "0")}`;

  const scopeOfWork = buildScopeOfWork(["salesforce", "consulting", "training"]);

  return {
    clientName,
    preparedDate: preparedOn.toLocaleDateString("en-US", dateFormat),
    referenceNumber,
    validUntil: validUntilDate.toLocaleDateString("en-US", dateFormat),
    introduction:
      "Thank you for taking the time to walk us through your goals. Based on our discovery call, we've put together the scope of services below, tailored to your team and pre-priced from our standard rate card.",
    scopeOfWork,
    paymentTerms: terms.paymentTerms,
    proposalTerms: terms.proposalTerms,
    taxesAndFees: terms.taxesAndFees,
  };
}
