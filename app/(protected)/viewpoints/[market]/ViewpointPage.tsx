"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "motion/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { ApiError } from "@/lib/api/client"
import { fetchViewpointDetail } from "@/lib/api/viewpoints"
import { formatAbsoluteTime, formatRelativeTime } from "@/lib/date"
import { isMarketCode, MARKET_LABELS } from "@/lib/markets"
import ViewpointEditorForm from "./_components/ViewpointEditorForm"
import ViewpointSkeleton from "./_components/ViewpointSkeleton"

export default function ViewpointPage({ market }: { market: string }) {
  const router = useRouter()
  const hasNotifiedRef = useRef(false)

  const marketCode = isMarketCode(market) ? market : null

  const query = useQuery({
    queryKey: ["viewpoint-detail", marketCode],
    enabled: Boolean(marketCode),
    queryFn: () => {
      if (!marketCode) {
        return Promise.reject(new Error("Invalid market"))
      }
      return fetchViewpointDetail(marketCode)
    },
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

  if (!marketCode) {
    return (
      <div className="px-6 py-10 lg:px-12">
        <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-surface/80 p-6 text-sm text-muted shadow-[var(--shadow-soft)]">
          無效的市場代碼。
        </div>
      </div>
    )
  }

  const detail = query.data
  const statusLabel = detail?.isCompleted ? "Completed" : "Pending"
  const statusTone = detail?.isCompleted
    ? "bg-accent-2/10 text-accent-2"
    : "bg-accent/10 text-accent"
  const updatedLabel = detail?.lastUpdatedAt
    ? formatRelativeTime(detail.lastUpdatedAt)
    : "尚未更新"
  const updatedTitle = detail?.lastUpdatedAt
    ? formatAbsoluteTime(detail.lastUpdatedAt)
    : ""
  const asOfLabel = detail?.asOfDate ?? "—"

  return (
    <div className="px-6 py-10 lg:px-12">
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto flex w-full max-w-5xl flex-col gap-8"
      >
        <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface/80 p-6 shadow-[var(--shadow-soft)] backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="text-xs font-semibold uppercase tracking-[0.3em] text-accent"
            >
              ← 返回 Dashboard
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
              {marketCode}
            </p>
            <h1 className="text-3xl font-semibold text-ink">
              {MARKET_LABELS[marketCode]}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}
            >
              {statusLabel}
            </span>
            <span>資料日期：{asOfLabel}</span>
            <span title={updatedTitle}>最後更新：{updatedLabel}</span>
            {detail?.lastUpdatedBy ? (
              <span>更新者：{detail.lastUpdatedBy.name}</span>
            ) : null}
          </div>
        </div>

        {query.isLoading ? <ViewpointSkeleton /> : null}

        {!query.isLoading && isForbidden ? (
          <div className="rounded-2xl border border-border bg-surface/80 p-6 text-sm text-muted shadow-[var(--shadow-soft)]">
            無權限存取此市場。
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

        {!query.isLoading && detail && !query.isError ? (
          <ViewpointEditorForm
            market={marketCode}
            asOfDate={detail.asOfDate}
            detail={detail}
          />
        ) : null}
      </motion.main>
    </div>
  )
}
