import { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "pill";
export type ButtonSize = "sm" | "md";

const BASE = "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap font-medium transition disabled:cursor-not-allowed disabled:opacity-40";

const VARIANT_SIZE_CLASSES: Record<ButtonVariant, Record<ButtonSize, string>> = {
  primary: {
    sm: "rounded-full px-3 py-1.5 text-xs",
    md: "rounded-full px-4 py-2.5 text-sm",
  },
  secondary: {
    sm: "rounded-full px-2.5 py-1.5 text-xs",
    md: "rounded-full px-4 py-2.5 text-sm",
  },
  pill: {
    sm: "rounded-full px-3 py-1.5 text-xs",
    md: "rounded-full px-4 py-2 text-sm",
  },
};

export function buttonClasses({
  variant,
  size = "md",
  active = false,
  className = "",
}: {
  variant: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
  className?: string;
}) {
  const shape = VARIANT_SIZE_CLASSES[variant][size];
  const tone =
    variant === "primary"
      ? "border border-ink bg-ink text-white hover:bg-ink/90"
      : variant === "secondary"
        ? "border border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
        : active
          ? "border border-ink bg-ink text-white"
          : "border border-line text-ink-muted hover:border-line-strong hover:text-ink";

  return `${BASE} ${shape} ${tone} ${className}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  size?: ButtonSize;
  active?: boolean;
}

export function Button({ variant, size = "md", active = false, className = "", ...props }: ButtonProps) {
  return <button className={buttonClasses({ variant, size, active, className })} {...props} />;
}
