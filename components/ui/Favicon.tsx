"use client";

import { useState } from "react";
import { Globe } from "lucide-react";

export function Favicon({ url, className = "h-3.5 w-3.5" }: { url?: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!url || failed) {
    return <Globe className={`shrink-0 text-ink-faint ${className}`} aria-hidden="true" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external, unregistered domains per client
    <img src={url} alt="" className={`shrink-0 rounded-sm ${className}`} onError={() => setFailed(true)} />
  );
}
