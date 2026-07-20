"use client";

import { Button } from "@/components/ui/Button";

interface ActionRowProps {
  isRepeatable: boolean;
  canSave: boolean;
  canBack: boolean;
  onSaveNext: () => void;
  onAddAnother: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function ActionRow({
  isRepeatable,
  canSave,
  canBack,
  onSaveNext,
  onAddAnother,
  onSkip,
  onBack,
}: ActionRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button type="button" variant="secondary" onClick={onBack} disabled={!canBack}>
        Back
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={onSkip}>
          Skip
        </Button>
        {isRepeatable && (
          <Button type="button" variant="secondary" onClick={onAddAnother} disabled={!canSave}>
            + Add Another Answer
          </Button>
        )}
        <Button type="button" variant="primary" onClick={onSaveNext} disabled={!canSave}>
          Save &amp; Next
          <kbd className="ml-2 rounded border border-white/30 px-1.5 py-0.5 text-[10px] font-normal opacity-80">
            ↵
          </kbd>
        </Button>
      </div>
    </div>
  );
}
