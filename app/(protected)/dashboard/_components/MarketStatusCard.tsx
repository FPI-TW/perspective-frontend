"use client"

import Link from "next/link"
import { motion } from "motion/react"
import type { ViewpointsStatusItem } from "@/lib/api/viewpoints"
import { MARKET_LABELS } from "@/lib/markets"

export default function MarketStatusCard({
  item,
}: {
  item: ViewpointsStatusItem
}) {
  const statusLabel = item.isCompleted ? "已完成" : "未完成"
  const statusTone = item.isCompleted
    ? "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30"
    : "bg-red-500/10 text-red-500 ring-1 ring-red-700/50"

  return (
    <Link href={`/viewpoints/${item.market}`} className="group">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface/90 p-5 shadow-(--shadow-soft) transition"
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

        <div className="mt-auto text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          檢視詳情
        </div>
      </motion.div>
    </Link>
  )
}
