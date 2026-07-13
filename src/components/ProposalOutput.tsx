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

/** Substitutes the [VENDOR_NAME] / [CLIENT_NAME] / [START_DATE] tokens used throughout sow-boilerplate.json. */
function fillPlaceholders(text: string, proposal: ProposalData) {
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

/** A numbered clause line, e.g. "3.1  Provide oversight on..." */
function Clause({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex gap-3 break-inside-avoid">
      <span className="shrink-0 text-sm font-medium text-muted-foreground">{number}</span>
      <p className="text-sm leading-relaxed">{text}</p>
    </div>
  );
}

/** A numbered subsection with its own heading, e.g. "5.6  Rollout Strategy" followed by body content. */
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
    <div className="break-inside-avoid">
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

      <div
        id="proposal-document"
        className="rounded-xl border border-border bg-card p-8 font-serif text-card-foreground shadow-sm sm:p-12 lg:p-14 print:p-0"
      >
        {logoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoDataUrl} alt="Client logo" className="mb-8 h-14 w-auto max-w-[220px] object-contain" />
        )}

        <div className="break-inside-avoid">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Statement of Work &amp; Agreement
          </p>
          <h1 className="mt-1 text-3xl font-semibold">Statement of Work for {proposal.clientName}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>Date: {proposal.preparedDate}</span>
            <span>Reference: {proposal.referenceNumber}</span>
            <span>Valid until: {proposal.validUntil}</span>
          </div>
        </div>

        <p className="mt-8 text-sm leading-relaxed">{fill(boilerplate.preamble)}</p>

        {/* 1. Term */}
        <div className="mt-10 break-inside-avoid">
          <h2 className="text-lg font-semibold">1. Term</h2>
          <p className="mt-3 text-sm leading-relaxed">{fill(boilerplate.termSection.body)}</p>
        </div>

        {/* 2. Objectives and Scope */}
        <div className="mt-10 space-y-4 break-inside-avoid">
          <h2 className="text-lg font-semibold">2. Objectives and Scope</h2>
          <p className="text-sm leading-relaxed">{proposal.introduction}</p>
          {proposal.scopeOfWork.items.map((item, index) => (
            <SubSection key={item.id} number={`2.${index + 1}`} heading={item.name}>
              <p className="text-sm leading-relaxed">{item.blurb}</p>
            </SubSection>
          ))}
        </div>

        {/* 3. Vendor Responsibilities */}
        <div className="mt-10 space-y-4 break-inside-avoid">
          <h2 className="text-lg font-semibold">3. Vendor Responsibilities</h2>
          <p className="text-sm leading-relaxed">{fill(boilerplate.vendorResponsibilities.intro)}</p>
          <div className="space-y-2">
            {boilerplate.vendorResponsibilities.clauses.map((clause, index) => (
              <Clause key={clause} number={`3.${index + 1}`} text={fill(clause)} />
            ))}
          </div>
        </div>

        {/* 4. Customer Responsibilities */}
        <div className="mt-10 space-y-4 break-inside-avoid">
          <h2 className="text-lg font-semibold">4. Customer Responsibilities</h2>
          <p className="text-sm leading-relaxed">{fill(boilerplate.customerResponsibilities.intro)}</p>
          <div className="space-y-2">
            {boilerplate.customerResponsibilities.clauses.map((clause, index) => (
              <Clause key={clause} number={`4.${index + 1}`} text={fill(clause)} />
            ))}
          </div>
        </div>

        {/* 5. Key Assumptions and Dependencies */}
        <div className="mt-10 space-y-4 break-inside-avoid">
          <h2 className="text-lg font-semibold">5. Key Assumptions and Dependencies</h2>
          <p className="text-sm leading-relaxed">{fill(boilerplate.assumptions.intro)}</p>
          <div className="space-y-2">
            {boilerplate.assumptions.clauses.map((clause, index) => (
              <Clause key={clause} number={`5.${index + 1}`} text={fill(clause)} />
            ))}
          </div>
          <SubSection number="5.6" heading={fill(boilerplate.assumptions.rolloutStrategyHeading)}>
            <p className="text-sm leading-relaxed">{proposal.rolloutStrategy}</p>
          </SubSection>
          <SubSection number="5.7" heading={fill(boilerplate.assumptions.otherAssumptionsHeading)}>
            {proposal.otherAssumptions.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
                {proposal.otherAssumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed">None identified.</p>
            )}
          </SubSection>
        </div>

        {/* 6. Professional Service Fees */}
        <div className="mt-10 space-y-4 break-inside-avoid">
          <h2 className="text-lg font-semibold">6. Professional Service Fees</h2>

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

          <SubSection number="6.1" heading={fill(boilerplate.feesSection.taxesHeading)}>
            <p className="text-sm leading-relaxed">{proposal.taxesAndFees}</p>
          </SubSection>

          <SubSection number="6.2" heading={fill(boilerplate.feesSection.paymentTermsHeading)}>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
              {proposal.paymentTerms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </SubSection>

          <SubSection number="6.3" heading={fill(boilerplate.feesSection.scopeVariationHeading)}>
            <p className="text-sm leading-relaxed">{fill(boilerplate.feesSection.scopeVariation)}</p>
          </SubSection>
        </div>

        {/* 7. Representatives */}
        <div className="mt-10 space-y-4 break-inside-avoid">
          <h2 className="text-lg font-semibold">7. Representatives</h2>
          <p className="text-sm leading-relaxed">{fill(boilerplate.representatives.intro)}</p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3 break-inside-avoid border border-border p-5">
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
            <div className="flex flex-col gap-3 break-inside-avoid border border-border p-5">
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

        {/* 8. General Terms */}
        <div className="mt-10 break-inside-avoid">
          <h2 className="text-lg font-semibold">8. General Terms</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
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
          <h2 className="text-lg font-semibold">{fill(boilerplate.appendixA.heading)}</h2>
          <p className="text-sm leading-relaxed">{fill(boilerplate.appendixA.intro)}</p>
          {boilerplate.appendixA.phases.map((phase) => (
            <div key={phase.name} className="break-inside-avoid">
              <h3 className="text-sm font-semibold text-card-foreground">{fill(phase.name)}</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed">
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
