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
};
