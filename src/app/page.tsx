"use client";

import { useState } from "react";
import CollapsedNotesPanel from "@/components/CollapsedNotesPanel";
import InputPanel from "@/components/InputPanel";
import ProposalOutput from "@/components/ProposalOutput";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { generateProposalStub } from "@/lib/generateProposal";
import type { ProposalData } from "@/lib/types";

const GENERATE_DELAY_MS = 500;

export default function Home() {
  const [notes, setNotes] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [editingNotes, setEditingNotes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Something went wrong generating the statement of work.");
        return;
      }

      const data: ProposalData = await res.json();
      setProposal(data);
      setEditingNotes(false);
    } catch {
      setError("Couldn't reach the server. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10 print:max-w-none print:p-0">
      <header className="no-print">
        <h1 className="text-xl font-semibold text-foreground">Statement of Work Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Turn discovery call notes into a client-ready statement of work.
        </p>
      </header>

      {!proposal ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          <div className="no-print">
            <InputPanel
              notes={notes}
              onNotesChange={setNotes}
              logoDataUrl={logoDataUrl}
              onLogoChange={setLogoDataUrl}
              onGenerate={handleGenerate}
              generating={generating}
            />
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </div>
          <ProposalOutput proposal={null} logoDataUrl={logoDataUrl} generating={generating} />
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div
            className={`no-print w-full transition-[flex-basis] duration-200 lg:shrink-0 ${
              editingNotes ? "lg:basis-[28rem]" : "lg:basis-72"
            }`}
          >
            {editingNotes ? (
              <InputPanel
                notes={notes}
                onNotesChange={setNotes}
                logoDataUrl={logoDataUrl}
                onLogoChange={setLogoDataUrl}
                onGenerate={handleGenerate}
                generating={generating}
                onCollapse={() => setEditingNotes(false)}
              />
            ) : (
              <CollapsedNotesPanel
                notes={notes}
                logoDataUrl={logoDataUrl}
                onEdit={() => setEditingNotes(true)}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <ProposalOutput proposal={proposal} logoDataUrl={logoDataUrl} generating={generating} />
          </div>
        </div>
      )}
    </main>
  );
}
