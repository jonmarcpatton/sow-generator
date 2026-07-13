"use client";

import boilerplate from "../../sow-boilerplate.json";
import type { ProposalData, ScopeItem, ScopeOfWork } from "@/lib/types";
import { VENDOR_NAME } from "@/lib/vendor";

type ProposalOutputProps = {
  proposal: ProposalData | null;
  logoDataUrl: string | null;
  generating: boolean;
};

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

/**
 * Substitutes the [VENDOR_NAME] / [CLIENT_NAME] / [START_DATE] tokens used
 * throughout sow-boilerplate.json, returning React nodes with the vendor and
 * customer names bolded. START_DATE substitutes as plain text. Handles any
 * number of occurrences of any token, in any order, and returns the text
 * unchanged when no tokens are present.
 */
function fillPlaceholders(text: string, proposal: ProposalData): React.ReactNode {
  const tokenPattern = /(\[VENDOR_NAME\]|\[CLIENT_NAME\]|\[START_DATE\])/g;

  return text.split(tokenPattern).map((part, index) => {
    switch (part) {
      case "[VENDOR_NAME]":
        return <strong key={index}>{proposal.vendorName}</strong>;
      case "[CLIENT_NAME]":
        return <strong key={index}>{proposal.clientName}</strong>;
      case "[START_DATE]":
        return proposal.startDate;
      default:
        return part;
    }
  });
}

/** Plain-string version of fillPlaceholders, for call sites typed as string (e.g. heading props). */
function fillText(text: string, proposal: ProposalData): string {
  return text
    .replaceAll("[VENDOR_NAME]", proposal.vendorName)
    .replaceAll("[CLIENT_NAME]", proposal.clientName)
    .replaceAll("[START_DATE]", proposal.startDate);
}

function BlankLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-end gap-2">
      <span className="w-28 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="h-5 flex-1 border-b border-border text-sm">{value}</span>
    </div>
  );
}

function SignatureBlock({
  role,
  companyName,
}: {
  role: "Vendor" | "Customer";
  companyName?: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 break-inside-avoid border border-border p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {role} Acceptance
      </p>
      <BlankLine label="Company Name" value={companyName} />
      <BlankLine label="Signature" />
      <BlankLine label="Name" />
      <BlankLine label="Title" />
      <BlankLine label="Date" />
    </div>
  );
}

function itemFeeText(item: ScopeItem) {
  const parts: string[] = [];
  if (item.oneTimeFee > 0) parts.push(`${formatCurrency(item.oneTimeFee)} one-time`);
  if (item.annualFee > 0) parts.push(`${formatCurrency(item.annualFee)}/yr`);
  if (item.monthlyFee) parts.push(`${formatCurrency(item.monthlyFee)}/mo`);
  return parts.join(" + ");
}

function InvestmentSummary({ scopeOfWork }: { scopeOfWork: ScopeOfWork }) {
  return (
    <div className="break-inside-avoid border-t border-border pt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Investment Summary
      </h3>
      <dl className="mt-3 space-y-2">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Total One-Time</dt>
          <dd className="text-lg font-semibold text-card-foreground">
            {formatCurrency(scopeOfWork.totalOneTime)}
          </dd>
        </div>
        {scopeOfWork.totalAnnual > 0 && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-muted-foreground">Total Annual Recurring</dt>
            <dd className="text-lg font-semibold text-card-foreground">
              {formatCurrency(scopeOfWork.totalAnnual)} / yr
            </dd>
          </div>
        )}
        {scopeOfWork.monthlyCommitments.map((commitment) => (
          <div key={commitment.name} className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-muted-foreground">{commitment.name} (monthly)</dt>
            <dd className="text-lg font-semibold text-card-foreground">
              {formatCurrency(commitment.monthlyFee)} / mo
              <span className="text-sm font-normal text-muted-foreground">
                {" "}
                × {commitment.commitmentMonths}-month commitment
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Marks AI-generated content on screen. Invisible in print. */
function AIContent({ children }: { children: React.ReactNode }) {
  return <div className="ai-content">{children}</div>;
}

function Clause({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex gap-3 break-inside-avoid pl-10">
      <span className="w-10 shrink-0 text-sm font-semibold text-card-foreground">{number}</span>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}

/** A numbered subsection with its own heading, e.g. "4.6  Rollout Strategy" followed by body content. */
function SubSection({
  number,
  heading,
  children,
}: {
  number: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="break-inside-avoid pl-10">
      <h3 className="text-sm font-semibold text-card-foreground">
        {number} {heading}
      </h3>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export default function ProposalOutput({
  proposal,
  logoDataUrl,
  generating,
}: ProposalOutputProps) {
  if (generating) {
    return (
      <section className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">Generating statement of work…</p>
      </section>
    );
  }

  if (!proposal) {
    return (
      <section className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Your generated statement of work will appear here. Paste your discovery call notes on
          the left and click &ldquo;Generate Statement of Work&rdquo; to get started.
        </p>
      </section>
    );
  }

  const fill = (text: string) => fillPlaceholders(text, proposal);
  const fillPlain = (text: string) => fillText(text, proposal);
  const hasTravelNote = proposal.scopeOfWork.items.some((item) => item.travelBilledSeparately);

  return (
    <section className="flex flex-col gap-4">
      <div className="no-print flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center rounded-md border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
        >
          Export to PDF
        </button>
      </div>

      <div className="no-print rounded-md border border-border bg-muted p-4">
        <p className="text-sm font-semibold text-card-foreground">AI-generated content is highlighted below.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Claude read the discovery notes and determined which services this engagement requires, wrote
          the scope narrative for each, and extracted the rollout strategy and dependencies directly from
          the notes. Fees, payment terms, and all contractual language are fixed, load verbatim from file,
          and are never seen or written by the AI.
        </p>
      </div>

      <div
        id="proposal-document"
        className="rounded-xl border border-border bg-card p-8 font-serif text-card-foreground shadow-sm sm:p-12 lg:p-14 print:p-0"
      >
        {logoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoDataUrl} alt="Client logo" className="mb-8 h-14 w-auto max-w-[220px] object-contain" />
        )}

        <div className="break-inside-avoid">
          <h1 className="mt-1 text-3xl font-semibold">Statement of Work for {proposal.clientName}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>Date: {proposal.preparedDate}</span>
            <span>Reference: {proposal.referenceNumber}</span>
            <span>Valid until: {proposal.validUntil}</span>
          </div>
        </div>

        <p className="mt-8 text-sm leading-relaxed">{fill(boilerplate.preamble)}</p>

        {/* 1. Objectives and Scope */}
        <div className="mt-10 space-y-4">
          <h2 className="border-b border-primary pb-1 text-lg font-semibold text-primary">
            1. Objectives and Scope
          </h2>
          <AIContent>
            <p className="text-sm leading-relaxed">{proposal.introduction}</p>
          </AIContent>
          {proposal.scopeOfWork.items.map((item, index) => (
            <SubSection key={item.id} number={`1.${index + 1}`} heading={item.name}>
              <AIContent>
                <p className="text-sm leading-relaxed">{item.blurb}</p>
              </AIContent>
            </SubSection>
          ))}
        </div>

        {/* 2. Vendor Responsibilities */}
        <div className="mt-10 space-y-4">
          <h2 className="border-b border-primary pb-1 text-lg font-semibold text-primary">
            2. Vendor Responsibilities
          </h2>
          <p className="text-sm leading-relaxed">{fill(boilerplate.vendorResponsibilities.intro)}</p>
          <div className="space-y-2">
            {boilerplate.vendorResponsibilities.clauses.map((clause, index) => (
              <Clause key={clause} number={`2.${index + 1}`} text={fillPlain(clause)} />
            ))}
          </div>
        </div>

        {/* 3. Customer Responsibilities */}
        <div className="mt-10 space-y-4">
          <h2 className="border-b border-primary pb-1 text-lg font-semibold text-primary">
            3. Customer Responsibilities
          </h2>
          <p className="text-sm leading-relaxed">{fill(boilerplate.customerResponsibilities.intro)}</p>
          <div className="space-y-2">
            {boilerplate.customerResponsibilities.clauses.map((clause, index) => (
              <Clause key={clause} number={`3.${index + 1}`} text={fillPlain(clause)} />
            ))}
          </div>
        </div>

        {/* 4. Key Assumptions and Dependencies */}
        <div className="mt-10 space-y-4">
          <h2 className="border-b border-primary pb-1 text-lg font-semibold text-primary">
            4. Key Assumptions and Dependencies
          </h2>
          <p className="text-sm leading-relaxed">{fill(boilerplate.assumptions.intro)}</p>
          <div className="space-y-2">
            {boilerplate.assumptions.clauses.map((clause, index) => (
              <Clause key={clause} number={`4.${index + 1}`} text={fillPlain(clause)} />
            ))}
          </div>
          <SubSection number="4.6" heading={fillPlain(boilerplate.assumptions.rolloutStrategyHeading)}>
            <AIContent>
              <p className="text-sm leading-relaxed">{proposal.rolloutStrategy}</p>
            </AIContent>
          </SubSection>
          <SubSection number="4.7" heading={fillPlain(boilerplate.assumptions.otherAssumptionsHeading)}>
            <AIContent>
              {proposal.otherAssumptions.length > 0 ? (
                <ul className="list-disc space-y-1 pl-10 text-sm leading-relaxed">
                  {proposal.otherAssumptions.map((assumption) => (
                    <li key={assumption}>{assumption}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm leading-relaxed">None identified.</p>
              )}
            </AIContent>
          </SubSection>
        </div>

        {/* 5. Professional Service Fees */}
        <div className="mt-10 space-y-4">
          <h2 className="border-b border-primary pb-1 text-lg font-semibold text-primary">
            5. Professional Service Fees
          </h2>

          <div className="pl-10">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-semibold">Service</th>
                  <th className="pb-2 text-right font-semibold">Fee</th>
                </tr>
              </thead>
              <tbody>
                {proposal.scopeOfWork.items.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="py-2 pr-4 font-medium text-card-foreground">{item.name}</td>
                    <td className="py-2 text-right text-muted-foreground whitespace-nowrap">
                      {itemFeeText(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <InvestmentSummary scopeOfWork={proposal.scopeOfWork} />

            {hasTravelNote && (
              <p className="text-xs text-muted-foreground">Travel and expenses billed separately.</p>
            )}

            <div className="mt-6 border-t border-border" />
          </div>

          <SubSection number="5.1" heading={fillPlain(boilerplate.feesSection.taxesHeading)}>
            <p className="text-sm leading-relaxed">{proposal.taxesAndFees}</p>
          </SubSection>

          <SubSection number="5.2" heading={fillPlain(boilerplate.feesSection.paymentTermsHeading)}>
            <ul className="list-disc space-y-1 pl-10 text-sm leading-relaxed">
              {proposal.paymentTerms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </SubSection>

          <SubSection number="5.3" heading={fillPlain(boilerplate.feesSection.scopeVariationHeading)}>
            <p className="text-sm leading-relaxed">{fill(boilerplate.feesSection.scopeVariation)}</p>
          </SubSection>
        </div>

        {/* 6. Representatives */}
        <div className="mt-10 space-y-4">
          <h2 className="border-b border-primary pb-1 text-lg font-semibold text-primary">
            6. Representatives
          </h2>
          <p className="text-sm leading-relaxed">{fill(boilerplate.representatives.intro)}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3 break-inside-avoid">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Customer
              </p>
              <BlankLine label="Name" value={proposal.customerRepresentative.name} />
              <BlankLine
                label="Address for notices"
                value={proposal.customerRepresentative.addressForNotices}
              />
              <BlankLine label="Email address" value={proposal.customerRepresentative.emailAddress} />
            </div>
            <div className="flex flex-col gap-3 break-inside-avoid">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Vendor
              </p>
              <BlankLine label="Name" value={proposal.vendorRepresentative.name} />
              <BlankLine
                label="Address for notices"
                value={proposal.vendorRepresentative.addressForNotices}
              />
              <BlankLine label="Email address" value={proposal.vendorRepresentative.emailAddress} />
            </div>
          </div>

          <p className="text-sm leading-relaxed">{fill(boilerplate.representatives.closing)}</p>
        </div>

        {/* 7. General Terms */}
        <div className="mt-10">
          <h2 className="border-b border-primary pb-1 text-lg font-semibold text-primary">
            7. General Terms
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-10 text-sm leading-relaxed">
            {proposal.proposalTerms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
        </div>

        {/* Execution */}
        <div className="mt-12 print:break-before-page">
          <p className="text-sm leading-relaxed">{fill(boilerplate.execution.intro)}</p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <SignatureBlock role="Vendor" companyName={VENDOR_NAME} />
            <SignatureBlock role="Customer" />
          </div>
        </div>

        {/* Appendix A */}
        <div className="mt-12 space-y-4 print:break-before-page">
          <h2 className="text-lg font-semibold">{fillPlain(boilerplate.appendixA.heading)}</h2>
          <p className="text-sm leading-relaxed">{fill(boilerplate.appendixA.intro)}</p>
          {boilerplate.appendixA.phases.map((phase) => (
            <div key={phase.name} className="break-inside-avoid">
              <h3 className="text-sm font-semibold text-card-foreground">{fillPlain(phase.name)}</h3>
              <ul className="mt-1 list-disc space-y-1 pl-10 text-sm leading-relaxed">
                {phase.activities.map((activity) => (
                  <li key={activity}>{fill(activity)}</li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-sm leading-relaxed">{fill(boilerplate.appendixA.closing)}</p>
        </div>
      </div>
    </section>
  );
}
