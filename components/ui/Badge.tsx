import { ReactNode } from "react";

export type BadgeTone = "neutral" | "success" | "warning";
export type BadgeSize = "sm" | "md";

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: "bg-paper text-ink-muted border-line-strong",
  success: "bg-success-soft text-success border-success-line",
  warning: "bg-warning-soft text-warning border-warning-line",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-[11px]",
};

export function Badge({
  tone,
  size = "md",
  children,
  className = "",
}: {
  tone: BadgeTone;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium tracking-wide ${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
