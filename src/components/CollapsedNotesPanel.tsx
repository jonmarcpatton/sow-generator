"use client";

type CollapsedNotesPanelProps = {
  notes: string;
  logoDataUrl: string | null;
  onEdit: () => void;
};

export default function CollapsedNotesPanel({
  notes,
  logoDataUrl,
  onEdit,
}: CollapsedNotesPanelProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">Discovery call notes</span>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-medium text-primary hover:underline"
        >
          Edit notes
        </button>
      </div>

      {logoDataUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoDataUrl}
          alt="Uploaded logo preview"
          className="h-8 w-auto max-w-[140px] object-contain"
        />
      )}

      <p className="line-clamp-4 text-xs text-muted-foreground">{notes}</p>
    </div>
  );
}
