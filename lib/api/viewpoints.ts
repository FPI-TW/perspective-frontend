import type { MarketCode } from "@/lib/markets"
import { apiFetch } from "@/lib/api/client"

export type ViewpointsStatusItem = {
  market: MarketCode
  isCompleted: boolean
  lastUpdatedAt: string | null
  lastUpdatedBy: { id: string; name: string } | null
  summary?: string
}

export type ViewpointsStatusResponse = {
  asOfDate: string
  items: ViewpointsStatusItem[]
}

export type ViewpointDetailResponse = {
  market: MarketCode
  asOfDate: string
  isCompleted: boolean
  content: string
  lastUpdatedAt: string | null
  lastUpdatedBy: { id: string; name: string } | null
}

export type UpdateViewpointInput = {
  asOfDate: string
  content: string
  markCompleted: boolean
}

export type UpdateViewpointResponse = {
  market: MarketCode
  asOfDate: string
  isCompleted: boolean
  lastUpdatedAt: string
  lastUpdatedBy: { id: string; name: string }
}

export function fetchViewpointsStatus(asOfDate?: string) {
  const params = new URLSearchParams()
  if (asOfDate) {
    params.set("date", asOfDate)
  }
  const query = params.toString()
  const path = query
    ? `/v1/viewpoints/status?${query}`
    : "/v1/viewpoints/status"
  return apiFetch<ViewpointsStatusResponse>(path)
}

export function fetchViewpointDetail(market: MarketCode, asOfDate?: string) {
  const params = new URLSearchParams()
  if (asOfDate) {
    params.set("date", asOfDate)
  }
  const query = params.toString()
  const path = query
    ? `/v1/viewpoints/${market}?${query}`
    : `/v1/viewpoints/${market}`
  return apiFetch<ViewpointDetailResponse>(path)
}

export function updateViewpoint(
  market: MarketCode,
  payload: UpdateViewpointInput
) {
  return apiFetch<UpdateViewpointResponse>(`/v1/viewpoints/${market}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}
