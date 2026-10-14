"use client";

import type { Category, CategoryId } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  categories: Category[];
  value: CategoryId | "all";
  onChange: (v: CategoryId | "all") => void;
  label?: string;
}

export function CategoryFilters({ categories, value, onChange, label = "Filter by category" }: Props) {
  const items: Array<{ id: CategoryId | "all"; label: string }> = [{ id: "all", label: "All" }, ...categories];
  return (
    <div className="chips" role="group" aria-label={label}>
      {items.map((c) => (
        <button
          key={c.id}
          type="button"
          data-focusable
          className={cn("chip", value === c.id && "is-active")}
          aria-pressed={value === c.id}
          onClick={() => onChange(c.id)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
