"use client";

import { useEffect, useRef, useState } from "react";
import { HubClient } from "@/lib/types";
import { Favicon } from "@/components/ui/Favicon";

type LoadState = "loading" | "loaded" | "error";

export interface HubSelection {
  hubClientId: string;
  hubSlackChannelId: string | null;
  hubFaviconUrl: string | null;
}

interface HubClientComboboxProps {
  value: string;
  onChange: (name: string) => void;
  onSelectHubClient: (hub: HubSelection | null) => void;
}

export function HubClientCombobox({ value, onChange, onSelectHubClient }: HubClientComboboxProps) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [hubClients, setHubClients] = useState<HubClient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/hub/clients");
        const data = await res.json();
        if (cancelled) return;
        if (!data.ok || !Array.isArray(data.clients)) {
          setLoadState("error");
          return;
        }
        setHubClients(data.clients);
        setLoadState("loaded");
      } catch {
        if (!cancelled) setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (loadState === "error") {
    return (
      <div>
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Acme Inc."
          className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
        />
        <p className="mt-1 text-[0.6875rem] text-ink-faint">
          Couldn&apos;t load client list — enter name manually.
        </p>
      </div>
    );
  }

  const query = value.trim().toLowerCase();
  const filtered = query
    ? hubClients.filter((c) => c.name.toLowerCase().includes(query))
    : hubClients;
  const showAddNew = query.length > 0 && filtered.length === 0;
  const rowCount = filtered.length + (showAddNew ? 1 : 0);

  function selectHubClient(client: HubClient) {
    onChange(client.name);
    onSelectHubClient({
      hubClientId: client.id,
      hubSlackChannelId: client.slack_channel_id,
      hubFaviconUrl: client.favicon_url,
    });
    setIsOpen(false);
  }

  function selectAddNew() {
    onChange(value.trim());
    onSelectHubClient(null);
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, rowCount - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex < filtered.length) {
        const client = filtered[highlightedIndex];
        if (client) selectHubClient(client);
      } else if (showAddNew) {
        selectAddNew();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        autoFocus
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          onSelectHubClient(null);
          setHighlightedIndex(0);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={loadState === "loading" ? "Loading clients…" : "e.g. Acme Inc."}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="hub-client-listbox"
        className="w-full rounded-md border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-ink focus:outline-none focus:ring-2 focus:ring-line"
      />
      {isOpen && loadState === "loaded" && rowCount > 0 && (
        <div
          id="hub-client-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-md border border-line bg-surface py-1 shadow-lg"
        >
          {filtered.map((client, i) => (
            <button
              type="button"
              key={client.id}
              onClick={() => selectHubClient(client)}
              onMouseEnter={() => setHighlightedIndex(i)}
              className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-ink transition ${
                highlightedIndex === i ? "bg-paper" : ""
              }`}
            >
              <Favicon url={client.favicon_url} />
              {client.name}
            </button>
          ))}
          {showAddNew && (
            <button
              type="button"
              onClick={selectAddNew}
              onMouseEnter={() => setHighlightedIndex(filtered.length)}
              className={`flex w-full items-center px-3 py-1.5 text-left text-sm text-ink-muted transition ${
                highlightedIndex === filtered.length ? "bg-paper" : ""
              }`}
            >
              No match found — add &quot;{value.trim()}&quot; as a new client
            </button>
          )}
        </div>
      )}
    </div>
  );
}
