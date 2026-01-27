import type { MarketCode, SummaryKey } from "@/lib/markets"
import { apiFetchInternal } from "@/lib/api/client"
import { MARKETS, MARKET_SUMMARY_KEYS } from "@/lib/markets"

export type ViewpointsStatusItem = {
  market: MarketCode
  summary?: string
  isCompleted: boolean // 是否已完成撰寫觀點(邏輯在前端判定)
}

export type FileInfoResponse = {
  date: string
  date_display: string
  file_path: string
  file_exists: boolean
  status: string // ppt檔案是否創建
}

export type SummaryResponse = Record<SummaryKey, string[]>

export type ViewpointsStatusResponse = {
  asOfDate: string
  asOfDateDisplay: string
  fileInfo: FileInfoResponse
  items: ViewpointsStatusItem[]
}

export type ViewpointDetailResponse = {
  market: MarketCode
  asOfDate: string
  asOfDateDisplay: string
  isCompleted: boolean
  content: string
  lastUpdatedAt: string | null
  lastUpdatedBy: { id: string; name: string } | null
  fileExists: boolean
  fileStatus: string
  filePath: string
}

export type UpdateViewpointResponse = {
  status: string
  message: string
  file: string
}

function normalizePoints(points: string[]) {
  return points.map(point => point.trim()).filter(Boolean)
}

export function fetchFileInfo() {
  return apiFetchInternal<FileInfoResponse>("/api/file-info")
}

export function fetchSummary() {
  return apiFetchInternal<SummaryResponse>("/api/summary")
}

export async function fetchViewpointsStatus() {
  const [fileInfo, summary] = await Promise.all([
    fetchFileInfo(),
    fetchSummary(),
  ])

  const items: ViewpointsStatusItem[] = MARKETS.map(market => {
    const points = normalizePoints(summary[market.summaryKey] ?? [])

    return {
      market: market.code,
      isCompleted: points.length > 0 && points[0] !== "。",
      summary: points.join(" / "),
    }
  })

  return {
    asOfDate: fileInfo.date,
    asOfDateDisplay: fileInfo.date_display,
    fileInfo,
    items,
  }
}

export async function fetchViewpointDetail(market: MarketCode) {
  const [fileInfo, summary] = await Promise.all([
    fetchFileInfo(),
    fetchSummary(),
  ])
  const summaryKey = MARKET_SUMMARY_KEYS[market]
  const points = normalizePoints(summary[summaryKey] ?? [])

  return {
    market,
    asOfDate: fileInfo.date,
    asOfDateDisplay: fileInfo.date_display,
    isCompleted: points.length > 0 && points[0] !== "。",
    content: points.join("\n\n"),
    lastUpdatedAt: null,
    lastUpdatedBy: null,
    fileExists: fileInfo.file_exists,
    fileStatus: fileInfo.status,
    filePath: fileInfo.file_path,
  }
}

export function updateViewpoint(market: MarketCode, points: string[]) {
  const summaryKey = MARKET_SUMMARY_KEYS[market]
  const payload: Partial<Record<SummaryKey, string[]>> = {
    [summaryKey]: normalizePoints(points),
  }

  return apiFetchInternal<UpdateViewpointResponse>("/api/summary", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
