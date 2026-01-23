import { NextResponse } from "next/server"

const RAW_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, "")
const API_KEY = process.env.API_KEY ?? ""

export const dynamic = "force-dynamic"

function buildExternalUrl(path: string) {
  if (!API_BASE_URL) return ""
  if (path.startsWith("/")) return `${API_BASE_URL}${path}`
  return `${API_BASE_URL}/${path}`
}

function configError(message: string) {
  return NextResponse.json(
    { error: { code: "SERVER_MISCONFIGURED", message } },
    { status: 500 }
  )
}

export async function GET() {
  if (!API_BASE_URL) return configError("Missing API base URL")
  if (!API_KEY) return configError("Missing API key")

  try {
    const response = await fetch(buildExternalUrl("/api/file-info"), {
      headers: {
        "X-API-Key": API_KEY,
      },
      cache: "no-store",
    })
    const payload = await response.json().catch(() => null)
    return NextResponse.json(payload, { status: response.status })
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_GATEWAY", message: "Upstream request failed" } },
      { status: 502 }
    )
  }
}
