export type ScopeItem = {
  id: string;
  name: string;
  description: string;
  category: "integration" | "professionalService";
  oneTimeFee: number;
  annualFee: number;
  monthlyFee?: number;
  commitmentMonths?: number;
  travelBilledSeparately?: boolean;
  /** Short placeholder prose explaining why this item is included — stubbed for now. */
  blurb: string;
};

export type MonthlyCommitment = {
  name: string;
  monthlyFee: number;
  commitmentMonths: number;
};

export type ScopeOfWork = {
  items: ScopeItem[];
  totalOneTime: number;
  totalAnnual: number;
  monthlyCommitments: MonthlyCommitment[];
};

export type Representative = {
  name: string;
  addressForNotices: string;
  emailAddress: string;
};

export type AIProvenance = {
  /** Total number of items in the rate card catalog that were offered to the model. */
  catalogSize: number;
  /** Number of items the model selected. */
  selectedCount: number;
};

export type ProposalData = {
  clientName: string;
  preparedDate: string;
  referenceNumber: string;
  validUntil: string;
  introduction: string;
  scopeOfWork: ScopeOfWork;
  paymentTerms: string[];
  proposalTerms: string[];
  taxesAndFees: string;
  /** Vendor display name, from src/lib/vendor.ts — substituted into boilerplate placeholders. */
  vendorName: string;
  /** SOW commencement date, formatted for display. Deterministic, never AI-generated. */
  startDate: string;
  /** AI-generated: rollout strategy extracted from the discovery notes (SOW section 5.6). */
  rolloutStrategy: string;
  /** AI-generated: other assumptions and dependencies extracted from the discovery notes (SOW section 5.7). */
  otherAssumptions: string[];
  /** Form fields for the Representatives section. Not AI-generated. */
  vendorRepresentative: Representative;
  customerRepresentative: Representative;
  /** Metadata about what the AI actually decided. Used to surface AI contribution in the UI. */
  aiProvenance: AIProvenance;
};
