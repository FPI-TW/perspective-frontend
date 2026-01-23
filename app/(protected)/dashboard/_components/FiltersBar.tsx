"use client"

export type DashboardFilter = "all" | "completed" | "pending"

const FILTERS: { value: DashboardFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "completed", label: "已完成" },
  { value: "pending", label: "未完成" },
]

export default function FiltersBar({
  value,
  onChange,
}: {
  value: DashboardFilter
  onChange: (value: DashboardFilter) => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-full w-fit border border-border bg-surface/80 p-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
      {FILTERS.map(filter => {
        const isActive = filter.value === value
        return (
          <button
            key={filter.value}
            type="button"
            onClick={() => onChange(filter.value)}
            className={`rounded-full px-3 py-1.5 transition ${
              isActive
                ? "bg-accent text-white shadow"
                : "text-muted hover:text-ink"
            }`}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}
