"use client"

import Link from "next/link"
import { motion } from "motion/react"
import type { ViewpointsStatusItem } from "@/lib/api/viewpoints"
import { MARKET_LABELS } from "@/lib/markets"
import { formatAbsoluteTime, formatRelativeTime } from "@/lib/date"
import { truncateText } from "@/lib/text"

export default function MarketStatusCard({
  item,
}: {
  item: ViewpointsStatusItem
}) {
  const statusLabel = item.isCompleted ? "Completed" : "Pending"
  const statusTone = item.isCompleted
    ? "bg-accent-2/10 text-accent-2"
    : "bg-accent/10 text-accent"

  const updatedLabel = item.lastUpdatedAt
    ? formatRelativeTime(item.lastUpdatedAt)
    : "尚未更新"

  const updatedTitle = item.lastUpdatedAt
    ? formatAbsoluteTime(item.lastUpdatedAt)
    : ""

  return (
    <Link href={`/viewpoints/${item.market}`} className="group">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface/90 p-5 shadow-[var(--shadow-soft)] transition"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-muted">
              {item.market}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-ink">
              {MARKET_LABELS[item.market]}
            </h3>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}
          >
            {statusLabel}
          </span>
        </div>

        <div className="text-sm text-muted">
          <p title={updatedTitle}>{updatedLabel}</p>
          {item.lastUpdatedBy ? (
            <p className="mt-1">更新者：{item.lastUpdatedBy.name}</p>
          ) : null}
        </div>

        {item.summary ? (
          <p className="text-sm leading-6 text-ink">
            {truncateText(item.summary, 250)}
          </p>
        ) : null}
        <div className="mt-auto text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          檢視詳情 →
        </div>
      </motion.div>
    </Link>
  )
}
