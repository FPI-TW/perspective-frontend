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

async function proxySummary(options?: { body?: unknown; method?: string }) {
  if (!API_BASE_URL) return configError("Missing API base URL")
  if (!API_KEY) return configError("Missing API key")

  const init: RequestInit = {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    cache: "no-store",
  }

  if (options?.body) {
    init.body = JSON.stringify(options.body)
  }

  const response = await fetch(buildExternalUrl("/api/summary"), init)

  const payload = await response.json().catch(() => null)
  return NextResponse.json(payload, { status: response.status })
}

export async function GET() {
  try {
    return await proxySummary()
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_GATEWAY", message: "Upstream request failed" } },
      { status: 502 }
    )
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json(
      { error: { code: "INVALID_BODY", message: "Invalid request body" } },
      { status: 400 }
    )
  }

  try {
    return await proxySummary({ body, method: "POST" })
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_GATEWAY", message: "Upstream request failed" } },
      { status: 502 }
    )
  }
}
