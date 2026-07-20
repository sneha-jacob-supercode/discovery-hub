import { FieldType } from "./types";

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "long_text", label: "Long text" },
  { value: "short_text", label: "Short text" },
  { value: "single_select", label: "Single select" },
  { value: "multi_select", label: "Multi select" },
  { value: "boolean", label: "Yes / No" },
  { value: "file", label: "File" },
  { value: "ranking", label: "Ranking" },
];

export const FIELD_TYPE_LABEL: Record<FieldType, string> = Object.fromEntries(
  FIELD_TYPES.map((t) => [t.value, t.label])
) as Record<FieldType, string>;
