"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api/client"
import { fetchViewpointsStatus } from "@/lib/api/viewpoints"
import { formatAbsoluteTime } from "@/lib/date"
import { MARKETS } from "@/lib/markets"
import DashboardSkeleton from "./_components/DashboardSkeleton"
import FiltersBar, { type DashboardFilter } from "./_components/FiltersBar"
import MarketStatusCard from "./_components/MarketStatusCard"

const FILTER_LABELS: Record<DashboardFilter, string> = {
  all: "全部",
  completed: "已完成",
  pending: "未完成",
}

export default function DashboardPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<DashboardFilter>("all")
  const hasNotifiedRef = useRef(false)

  const query = useQuery({
    queryKey: ["viewpoints-status"],
    queryFn: () => fetchViewpointsStatus(),
  })

  const apiError = query.error instanceof ApiError ? query.error : null
  const isForbidden = apiError?.status === 403

  useEffect(() => {
    if (!apiError) {
      hasNotifiedRef.current = false
      return
    }

    if (apiError.status === 401 && !hasNotifiedRef.current) {
      toast.error("請先登入")
      hasNotifiedRef.current = true
      router.push("/login")
    }

    if (apiError.status === 403 && !hasNotifiedRef.current) {
      toast.error("無權限")
      hasNotifiedRef.current = true
    }
  }, [apiError, router])

  const byMarket = new Map(
    (query.data?.items ?? []).map(item => [item.market, item])
  )
  const orderedItems = MARKETS.map(
    market =>
      byMarket.get(market.code) ?? {
        market: market.code,
        isCompleted: false,
        lastUpdatedAt: null,
        lastUpdatedBy: null,
        summary: "",
      }
  )

  const filteredItems =
    filter === "completed"
      ? orderedItems.filter(item => item.isCompleted)
      : filter === "pending"
        ? orderedItems.filter(item => !item.isCompleted)
        : orderedItems

  const asOfLabel = query.data?.asOfDate ?? "—"
  const asOfDateTitle = query.data?.asOfDate
    ? formatAbsoluteTime(`${query.data.asOfDate}T00:00:00`)
    : ""

  return (
    <div className="px-6 py-10 lg:px-12">
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto flex w-full max-w-6xl flex-col gap-8"
      >
        <header className="flex flex-col gap-6 rounded-3xl border border-border bg-surface/80 p-6 shadow-[var(--shadow-soft)] backdrop-blur lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
              Analyst Viewpoints Dashboard
            </p>
            <h1 className="text-3xl font-semibold text-ink sm:text-4xl">
              八大市場觀點完成度
            </h1>
            <p className="max-w-xl text-sm leading-6 text-muted">
              追蹤最新分析師輸入狀態、最後更新時間與摘要內容。
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <FiltersBar value={filter} onChange={setFilter} />
          </div>
        </header>

        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          <span>狀態：{FILTER_LABELS[filter]}</span>
          <span title={asOfDateTitle}>資料日期：{asOfLabel}</span>
        </div>

        {query.isLoading ? <DashboardSkeleton /> : null}

        {!query.isLoading && isForbidden ? (
          <div className="rounded-2xl border border-border bg-surface/80 p-6 text-sm text-muted shadow-[var(--shadow-soft)]">
            無權限存取此資料。
          </div>
        ) : null}

        {!query.isLoading && query.isError && !isForbidden ? (
          <div className="rounded-2xl border border-border bg-surface/80 p-6 text-sm text-muted shadow-[var(--shadow-soft)]">
            <p>資料載入失敗，請稍後再試。</p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-4 inline-flex h-10 items-center justify-center rounded-full border border-accent px-4 text-xs font-semibold uppercase tracking-[0.25em] text-accent transition hover:bg-accent hover:text-white"
            >
              重新整理
            </button>
          </div>
        ) : null}

        {!query.isLoading && !query.isError ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filteredItems.map(item => (
              <MarketStatusCard key={item.market} item={item} />
            ))}
          </div>
        ) : null}
      </motion.main>
    </div>
  )
}
