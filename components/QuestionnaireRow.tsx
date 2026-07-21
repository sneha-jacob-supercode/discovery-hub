"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Questionnaire } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";
import { useQuestionnaireStore } from "@/lib/questionnaireStore";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EditQuestionnaireDialog } from "@/components/EditQuestionnaireDialog";

export function QuestionnaireRow({ questionnaire }: { questionnaire: Questionnaire }) {
  const router = useRouter();
  const { updateQuestionnaire, deleteQuestionnaire } = useQuestionnaireStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleSaveName(name: string) {
    await updateQuestionnaire(questionnaire.id, name);
    setShowEditDialog(false);
  }

  async function handleConfirmDelete() {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await deleteQuestionnaire(questionnaire.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      setDeleteError(
        err instanceof Error && err.message === "questionnaire_in_use"
          ? "This questionnaire is assigned to one or more clients and can't be deleted. Reassign or remove those clients first."
          : "Something went wrong deleting this questionnaire. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/questionnaires/${questionnaire.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/questionnaires/${questionnaire.id}`);
      }}
      className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition hover:bg-paper"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{questionnaire.name}</p>
        <p className="mt-0.5 font-mono text-[0.6875rem] text-ink-faint">
          {questionnaire.questions.length} question{questionnaire.questions.length === 1 ? "" : "s"} · Updated{" "}
          {formatRelativeTime(questionnaire.last_updated)}
        </p>
      </div>

      <div ref={menuRef} className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-full p-1.5 text-ink-faint transition hover:bg-paper hover:text-ink"
          aria-label="More actions"
          aria-expanded={menuOpen}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-md border border-line bg-surface py-1 shadow-lg">
            <button
              onClick={() => {
                setMenuOpen(false);
                setShowEditDialog(true);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink transition hover:bg-paper"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Edit
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                setDeleteError(null);
                setShowDeleteConfirm(true);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink transition hover:bg-paper hover:text-warning"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              Delete
            </button>
          </div>
        )}
      </div>

      {showEditDialog && (
        <div onClick={(e) => e.stopPropagation()}>
          <EditQuestionnaireDialog
            initialName={questionnaire.name}
            onCancel={() => setShowEditDialog(false)}
            onSave={handleSaveName}
          />
        </div>
      )}

      {showDeleteConfirm && (
        <div onClick={(e) => e.stopPropagation()}>
          <ConfirmDialog
            title={`Delete "${questionnaire.name}"?`}
            description="This removes the questionnaire and all of its questions permanently. This can't be undone."
            confirmLabel={isDeleting ? "Deleting…" : "Delete"}
            confirmDisabled={isDeleting}
            error={deleteError}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setDeleteError(null);
            }}
            onConfirm={handleConfirmDelete}
          />
        </div>
      )}
    </div>
  );
}
