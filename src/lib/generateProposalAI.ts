import Anthropic from "@anthropic-ai/sdk";
import terms from "../../terms.json";
import { buildScopeOfWork, catalog, integrationIds } from "./generateProposal";
import type { ProposalData, ScopeOfWork } from "./types";
import { VENDOR_NAME } from "./vendor";

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env automatically
const MODEL = "claude-sonnet-5";

type Trip1Response = {
  clientName: string;
  selectedItemIds: string[];
};

type Trip2Response = {
  introduction: string;
  blurbs: Record<string, string>;
  rolloutStrategy: string;
  otherAssumptions: string[];
};

const TRIP_1_SYSTEM_PROMPT = `You are helping assemble a Statement of Work for a SaaS engagement. You will receive discovery-call notes describing a prospective customer's situation, systems, and needs.

Your job is to do TWO things and nothing else:

1. Select which line items from the provided catalog fit this customer's needs, based strictly on what the discovery notes indicate. Select at least one item. Do not select items the notes give no basis for. Do not pad the selection. Choose only what the customer's stated situation actually calls for.

2. Identify the customer's organization name from the notes.

You are NOT pricing anything, NOT writing prose, and NOT deciding terms. Only selection and the client name.

The catalog of available line items (select only from these exact IDs):
{{CATALOG}}

Respond with ONLY a JSON object in exactly this shape, no other text, no markdown, no code fences:
{
  "clientName": "the customer organization name, or 'Your Organization' if the notes do not clearly state one",
  "selectedItemIds": ["id1", "id2"]
}

Every ID in selectedItemIds MUST be one of the exact IDs from the catalog above. Do not invent IDs. Do not modify IDs.`;

const TRIP_2_SYSTEM_PROMPT = `You are writing the narrative prose for a Statement of Work for a SaaS engagement. The scope has already been decided; your only job is to write clear, professional prose that reflects it.

You will receive the discovery-call notes and the list of services that have been selected for this engagement (with names and descriptions). You will write:

1. An "introduction": a short opening (2-4 sentences) that frames the engagement in terms of the customer's objectives as surfaced in the discovery notes. Ground it in what the notes actually say. Do not thank the customer effusively or use sales language. Write in the register of a professional services engagement, not a marketing pitch.

2. A "blurb" for each selected service: one or two sentences that BOTH describe what will be delivered under this service AND connect it to the specific need or situation raised in the discovery notes. Lead with the deliverable (what the engagement will actually do), then ground it in the customer's context. This is contract scope language, not a sales pitch — describe and connect, do not persuade or promise outcomes.

3. A "rolloutStrategy": one to three sentences describing how this engagement will be rolled out, based strictly on what the discovery notes say about timelines, phasing, pilot groups, business units, geographies, or sequencing. If the notes give no basis for a rollout strategy, respond with exactly: "Rollout strategy to be confirmed during the project initiation phase." Do not invent a rollout approach the notes do not support.

4. An "otherAssumptions": an array of assumptions or dependencies that this engagement rests on, drawn strictly from the discovery notes. Each entry is one sentence. Include only assumptions the notes actually give a basis for — for example, a stated dependency on a third-party system, an internal deadline, a resourcing constraint, or a prerequisite the customer must complete. Do not restate general contractual assumptions. Do not pad. If the notes support no specific assumptions, return an empty array.

Rules:
- Do NOT mention, invent, or reference any prices, fees, totals, or dollar amounts. Pricing is handled separately and is not your concern.
- Do NOT restate or paraphrase contractual terms.
- Do NOT add services or claims beyond the selected list.
- Write plainly and specifically. Avoid filler and boilerplate.

The selected services:
{{SELECTED_ITEMS}}

Respond with ONLY a JSON object in exactly this shape, no other text, no markdown, no code fences:
{
  "introduction": "the introduction prose",
  "blurbs": {
    "itemId1": "blurb for item 1",
    "itemId2": "blurb for item 2"
  },
  "rolloutStrategy": "the rollout strategy prose",
  "otherAssumptions": ["assumption one", "assumption two"]
}

The keys in "blurbs" MUST exactly match the IDs of the selected services provided above.`;

/** Catalog exposed to Trip 1 — id/name/description/category only, never fees. */
function buildCatalogPromptString(): string {
  const entries = catalog.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    category: integrationIds.has(item.id) ? "integration" : "professionalService",
  }));
  return JSON.stringify(entries, null, 2);
}

/** Validated selection exposed to Trip 2 — id/name/description only, never fees. */
function buildSelectedItemsPromptString(ids: string[]): string {
  const entries = ids.map((id) => {
    const item = catalog.find((candidate) => candidate.id === id);
    if (!item) {
      throw new Error(`Unknown rate card line item: ${id}`);
    }
    return { id: item.id, name: item.name, description: item.description };
  });
  return JSON.stringify(entries, null, 2);
}

function extractJsonPayload(content: Anthropic.Message["content"]): string {
  const textBlock = content.find(
    (block): block is Anthropic.TextBlock => block.type === "text",
  );
  if (!textBlock) {
    throw new Error("Claude response did not include a text block.");
  }

  const trimmed = textBlock.text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced ? fenced[1].trim() : trimmed;
}

function parseJsonResponse<T>(content: Anthropic.Message["content"]): T {
  const payload = extractJsonPayload(content);
  try {
    return JSON.parse(payload) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse Claude's response as JSON: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

/**
 * Real generation path — two Claude API calls plus deterministic pricing.
 *
 * Trip 1 selects line items and the client name from the catalog (no fees
 * shown to the model). A non-AI validation checkpoint drops any IDs the
 * model invented. Trip 2 writes prose (introduction + per-item blurbs) for
 * only the validated selection (again, no fees shown to the model). Pricing
 * comes solely from buildScopeOfWork, and terms are spread verbatim from
 * terms.json — the model never sees or produces prices or terms.
 */
export async function generateProposalAI(notes: string): Promise<ProposalData> {
  // --- Trip 1: selection + client name ---
  const trip1System = TRIP_1_SYSTEM_PROMPT.replace(
    "{{CATALOG}}",
    () => buildCatalogPromptString(),
  );

  const trip1Response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: trip1System,
    messages: [{ role: "user", content: notes }],
  });

  const trip1Result = parseJsonResponse<Trip1Response>(trip1Response.content);

  // --- Validation checkpoint (no AI) ---
  const validatedIds = trip1Result.selectedItemIds.filter((id) => {
    const exists = catalog.some((item) => item.id === id);
    if (!exists) {
      console.warn(`Dropped unknown line item ID from AI selection: ${id}`);
    }
    return exists;
  });

  if (validatedIds.length === 0) {
    throw new Error("AI selection produced no valid line items.");
  }

  // --- Trip 2: prose ---
  const trip2System = TRIP_2_SYSTEM_PROMPT.replace(
    "{{SELECTED_ITEMS}}",
    () => buildSelectedItemsPromptString(validatedIds),
  );

  const trip2Response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3072,
    system: trip2System,
    messages: [{ role: "user", content: notes }],
  });

  const trip2Result = parseJsonResponse<Trip2Response>(trip2Response.content);

  // --- Assembly (no AI) ---
  const rawScopeOfWork = buildScopeOfWork(validatedIds);
  const scopeOfWork: ScopeOfWork = {
    ...rawScopeOfWork,
    items: rawScopeOfWork.items.map((item) => ({
      ...item,
      blurb: trip2Result.blurbs[item.id] ?? "Included as part of this engagement.",
    })),
  };

  const clientName = trip1Result.clientName.trim() || "Your Organization";

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

  return {
    clientName,
    preparedDate: preparedOn.toLocaleDateString("en-US", dateFormat),
    referenceNumber,
    validUntil: validUntilDate.toLocaleDateString("en-US", dateFormat),
    introduction: trip2Result.introduction,
    scopeOfWork,
    paymentTerms: terms.paymentTerms,
    proposalTerms: terms.proposalTerms,
    taxesAndFees: terms.taxesAndFees,
    vendorName: VENDOR_NAME,
    startDate: preparedOn.toLocaleDateString("en-US", dateFormat),
    rolloutStrategy:
      trip2Result.rolloutStrategy?.trim() ||
      "Rollout strategy to be confirmed during the project initiation phase.",
    otherAssumptions: Array.isArray(trip2Result.otherAssumptions)
      ? trip2Result.otherAssumptions
      : [],
    vendorRepresentative: {
      name: "",
      addressForNotices: "",
      emailAddress: "",
    },
    customerRepresentative: {
      name: "",
      addressForNotices: "",
      emailAddress: "",
    },
  };
}
