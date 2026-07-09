"use client";

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

function BlankLine({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-end gap-2">
      <span className="w-28 shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="h-5 flex-1 border-b border-border text-sm">{value}</span>
    </div>
  );
}

function PartyBlock({
  role,
  companyName,
}: {
  role: "Vendor" | "Customer";
  companyName?: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-3 break-inside-avoid border border-border p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {role}
      </p>
      <BlankLine label="Company Name" value={companyName} />
      <BlankLine label="Signatory Name" />
      <BlankLine label="Title" />
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

function ServiceGroup({ title, items }: { title: string; items: ScopeItem[] }) {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-3 list-none space-y-5">
        {items.map((item) => (
          <li
            key={item.id}
            className="break-inside-avoid border-t border-border pt-4 first:border-t-0 first:pt-0"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-sm font-medium text-card-foreground">{item.name}</span>
              <span className="whitespace-nowrap text-sm text-muted-foreground">
                {itemFeeText(item)}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            <p className="mt-1 text-sm italic text-muted-foreground">{item.blurb}</p>
            {item.travelBilledSeparately && (
              <p className="mt-1 text-xs text-muted-foreground">
                Travel and expenses billed separately.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
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

export default function ProposalOutput({
  proposal,
  logoDataUrl,
  generating,
}: ProposalOutputProps) {
  if (generating) {
    return (
      <section className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-sm font-medium text-muted-foreground">Generating proposal…</p>
      </section>
    );
  }

  if (!proposal) {
    return (
      <section className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Your generated proposal will appear here. Paste your discovery call notes on the left
          and click &ldquo;Generate Proposal&rdquo; to get started.
        </p>
      </section>
    );
  }

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
            Services Proposal &amp; Agreement
          </p>
          <h1 className="mt-1 text-3xl font-semibold">Services Proposal for {proposal.clientName}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>Date: {proposal.preparedDate}</span>
            <span>Reference: {proposal.referenceNumber}</span>
            <span>Valid until: {proposal.validUntil}</span>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PartyBlock role="Vendor" companyName={VENDOR_NAME} />
          <PartyBlock role="Customer" />
        </div>

        <p className="mt-8 leading-relaxed">{proposal.introduction}</p>

        <div className="mt-10">
          <h2 className="text-lg font-semibold">Scope of Services</h2>
          <div className="mt-4 space-y-8 border border-border p-6">
            <ServiceGroup
              title="Integrations"
              items={proposal.scopeOfWork.items.filter((item) => item.category === "integration")}
            />
            <ServiceGroup
              title="Professional Services"
              items={proposal.scopeOfWork.items.filter(
                (item) => item.category === "professionalService",
              )}
            />
            <InvestmentSummary scopeOfWork={proposal.scopeOfWork} />
          </div>
        </div>

        <div className="mt-12 space-y-8 text-left">
          <div className="break-inside-avoid">
            <h2 className="text-lg font-semibold">Payment Terms</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {proposal.paymentTerms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </div>

          <div className="break-inside-avoid">
            <h2 className="text-lg font-semibold">Proposal Terms</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed">
              {proposal.proposalTerms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </div>

          <div className="break-inside-avoid">
            <h2 className="text-lg font-semibold">Taxes and Fees</h2>
            <p className="mt-3 text-sm leading-relaxed">{proposal.taxesAndFees}</p>
          </div>
        </div>

        <div className="mt-12 print:break-before-page">
          <h2 className="text-lg font-semibold">Acceptance</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This proposal will be sent for signature via DocuSign upon acceptance.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <SignatureBlock role="Vendor" companyName={VENDOR_NAME} />
            <SignatureBlock role="Customer" />
          </div>
        </div>
      </div>
    </section>
  );
}
