"use client";

import { useRef, useState } from "react";

type InputPanelProps = {
  notes: string;
  onNotesChange: (notes: string) => void;
  logoDataUrl: string | null;
  onLogoChange: (dataUrl: string | null) => void;
  onGenerate: () => void;
  generating: boolean;
  /** Shows a "Collapse" control when provided (used once a proposal already exists). */
  onCollapse?: () => void;
};

const NOTES_FILE_ACCEPT =
  ".txt,.docx,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export default function InputPanel({
  notes,
  onNotesChange,
  logoDataUrl,
  onLogoChange,
  onGenerate,
  generating,
  onCollapse,
}: InputPanelProps) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const notesFileInputRef = useRef<HTMLInputElement>(null);
  const [extractingNotes, setExtractingNotes] = useState(false);
  const [notesFileError, setNotesFileError] = useState<string | null>(null);

  function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onLogoChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleRemoveLogo() {
    onLogoChange(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  }

  async function handleNotesFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setNotesFileError(null);
    setExtractingNotes(true);

    try {
      const name = file.name.toLowerCase();
      let text: string;

      if (name.endsWith(".docx")) {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      } else if (name.endsWith(".txt")) {
        text = await file.text();
      } else {
        throw new Error("Unsupported file type. Please upload a .txt or .docx file.");
      }

      if (!text.trim()) {
        throw new Error("That file didn't contain any readable text.");
      }

      onNotesChange(text.trim());
    } catch (error) {
      setNotesFileError(
        error instanceof Error ? error.message : "Could not read that file.",
      );
    } finally {
      setExtractingNotes(false);
      if (notesFileInputRef.current) notesFileInputRef.current.value = "";
    }
  }

  const canGenerate = notes.trim().length > 0 && !generating;

  return (
    <section className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="notes" className="text-sm font-medium text-foreground">
            Discovery call notes
          </label>
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Collapse
            </button>
          )}
        </div>

        <textarea
          id="notes"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Paste or type your notes from the discovery call…"
          className="min-h-[320px] w-full resize-y rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>Paste your notes above, or</span>
          <label className="cursor-pointer font-medium text-primary hover:underline">
            upload a file (.txt, .docx)
            <input
              ref={notesFileInputRef}
              type="file"
              accept={NOTES_FILE_ACCEPT}
              onChange={handleNotesFileUpload}
              className="hidden"
            />
          </label>
          {extractingNotes && <span>Extracting text…</span>}
        </div>
        {notesFileError && <p className="text-xs text-destructive">{notesFileError}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">
          Client logo <span className="text-muted-foreground font-normal">(optional)</span>
        </span>

        {logoDataUrl ? (
          <div className="flex items-center gap-3 rounded-md border border-border bg-secondary p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoDataUrl}
              alt="Uploaded logo preview"
              className="h-10 w-auto max-w-[160px] object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="ml-auto text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Remove
            </button>
          </div>
        ) : (
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-secondary-foreground hover:file:bg-accent"
          />
        )}
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {generating ? "Generating…" : "Generate Proposal"}
      </button>
    </section>
  );
}
