"use client";

import { Button } from "@/components/ui/Button";

interface ActionRowProps {
  canSave: boolean;
  canBack: boolean;
  onSaveNext: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export function ActionRow({ canSave, canBack, onSaveNext, onSkip, onBack }: ActionRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button type="button" variant="secondary" onClick={onBack} disabled={!canBack}>
        Back
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={onSkip}>
          Skip
        </Button>
        <Button type="button" variant="primary" onClick={onSaveNext} disabled={!canSave}>
          Save &amp; Next
          <kbd className="ml-2 rounded border border-white/30 px-1.5 py-0.5 text-[0.625rem] font-normal opacity-80">
            ↵
          </kbd>
        </Button>
      </div>
    </div>
  );
}
