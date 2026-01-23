"use client"

export default function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="flex h-48 animate-pulse flex-col gap-4 rounded-2xl border border-border bg-surface/70 p-5 shadow-(--shadow-soft)"
        >
          <div className="h-3 w-1/3 rounded-full bg-border/70" />
          <div className="h-5 w-2/3 rounded-full bg-border/70" />
          <div className="mt-2 h-3 w-1/2 rounded-full bg-border/70" />
          <div className="h-3 w-2/3 rounded-full bg-border/70" />
          <div className="mt-auto h-3 w-1/3 rounded-full bg-border/70" />
        </div>
      ))}
    </div>
  )
}
