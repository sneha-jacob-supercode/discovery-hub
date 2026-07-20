"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, Copy, Trash2 } from "lucide-react";
import { Client, Questionnaire } from "@/lib/types";
import { getProgress } from "@/lib/status";
import { formatRelativeTime } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useClientStore } from "@/lib/clientStore";

export function ClientCard({ client, questionnaire }: { client: Client; questionnaire: Questionnaire }) {
  const { deleteClient, duplicateClient } = useClientStore();
  const progress = getProgress(client, questionnaire);
  const pct = progress.total === 0 ? 0 : Math.round((progress.answered / progress.total) * 100);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  return (
    <div className="group relative flex flex-col justify-between rounded-lg border border-line bg-surface p-5 transition hover:border-line-strong">
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold text-ink">{client.name}</h3>
            {client.channel_name && (
              <p className="mt-0.5 truncate font-mono text-xs text-ink-faint">{client.channel_name}</p>
            )}
          </div>

          <div ref={menuRef} className="relative shrink-0">
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
                    duplicateClient(client.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink transition hover:bg-paper"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
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
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between font-mono text-[11px] text-ink-muted">
            <span>
              {progress.answered} of {progress.total} answered
            </span>
            <span>{pct}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-paper">
            <div
              className="h-full rounded-full bg-ink transition-[width]"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="min-w-0 truncate font-mono text-[11px] text-ink-faint">
          {questionnaire.name} · Updated {formatRelativeTime(client.last_updated)}
        </span>
        <div className="flex shrink-0 gap-2">
          <Link href={`/client/${client.id}?view=table`} className={buttonClasses({ variant: "secondary", size: "sm" })}>
            View Sheet
          </Link>
          <Link href={`/client/${client.id}`} className={buttonClasses({ variant: "primary", size: "sm" })}>
            Open
          </Link>
        </div>
      </div>

      {showDeleteConfirm && (
        <ConfirmDialog
          title={`Delete ${client.name}?`}
          description="This removes the client and all of its answers permanently. This can't be undone."
          confirmLabel="Delete"
          onCancel={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            deleteClient(client.id);
            setShowDeleteConfirm(false);
          }}
        />
      )}
    </div>
  );
}
