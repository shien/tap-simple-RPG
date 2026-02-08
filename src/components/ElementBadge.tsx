import type { Element } from "@/lib/types";

const ELEMENT_CONFIG: Record<Element, { label: string; className: string }> = {
  fire: { label: "火", className: "bg-red-900 text-red-300" },
  ice: { label: "氷", className: "bg-blue-900 text-blue-300" },
  thunder: { label: "雷", className: "bg-yellow-900 text-yellow-300" },
};

export function ElementBadge({ element }: { element: Element }) {
  const config = ELEMENT_CONFIG[element];
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}
