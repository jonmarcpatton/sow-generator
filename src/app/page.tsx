"use client";

import { useState } from "react";
import CollapsedNotesPanel from "@/components/CollapsedNotesPanel";
import InputPanel from "@/components/InputPanel";
import ProposalOutput from "@/components/ProposalOutput";
import { generateProposalStub } from "@/lib/generateProposal";
import type { ProposalData } from "@/lib/types";

const GENERATE_DELAY_MS = 500;

export default function Home() {
  const [notes, setNotes] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [editingNotes, setEditingNotes] = useState(true);

  function handleGenerate() {
    setGenerating(true);
    setTimeout(() => {
      setProposal(generateProposalStub(notes));
      setGenerating(false);
      setEditingNotes(false);
    }, GENERATE_DELAY_MS);
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 sm:px-10 print:max-w-none print:p-0">
      <header className="no-print">
        <h1 className="text-xl font-semibold text-foreground">Proposal Generator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Turn discovery call notes into a client-ready proposal.
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
