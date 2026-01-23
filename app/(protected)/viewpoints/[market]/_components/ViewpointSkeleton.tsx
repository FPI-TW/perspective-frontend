"use client"

export default function ViewpointSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-6">
      <div className="rounded-3xl border border-border bg-surface/70 p-6 shadow-[var(--shadow-soft)]">
        <div className="h-3 w-24 rounded-full bg-border/70" />
        <div className="mt-4 h-6 w-56 rounded-full bg-border/70" />
        <div className="mt-3 h-4 w-40 rounded-full bg-border/70" />
      </div>
      <div className="rounded-2xl border border-border bg-surface/70 p-6 shadow-[var(--shadow-soft)]">
        <div className="h-4 w-36 rounded-full bg-border/70" />
        <div className="mt-4 h-24 w-full rounded-2xl bg-border/70" />
        <div className="mt-4 h-24 w-full rounded-2xl bg-border/70" />
        <div className="mt-4 h-24 w-full rounded-2xl bg-border/70" />
      </div>
    </div>
  )
}
