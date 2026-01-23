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

export function fetchViewpointsStatus() {
  return apiFetch<ViewpointsStatusResponse>("/v1/viewpoints/status")
}

export function fetchViewpointDetail(market: MarketCode) {
  return apiFetch<ViewpointDetailResponse>(`/v1/viewpoints/${market}`)
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
