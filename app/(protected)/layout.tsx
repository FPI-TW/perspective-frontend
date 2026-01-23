import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"

async function isAuthorized() {
  const sessionCookie = (await cookies()).get("session")?.value
  const internalHeader = (await headers()).get("x-internal-auth")
  return Boolean(sessionCookie || internalHeader)
}

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode
}) {
  if (!(await isAuthorized())) {
    redirect("/login")
  }

  return <div className="min-h-screen text-ink">{children}</div>
}
