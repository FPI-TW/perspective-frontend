"use client"

import { useRouter } from "next/navigation"
import type { FormEvent } from "react"
import { useState } from "react"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!account.trim() || !password) {
      toast.error("請輸入帳號與密碼")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ account, password }),
      })

      const payload = (await response.json().catch(() => null)) as {
        error?: { message?: string }
      } | null

      if (!response.ok) {
        toast.error(payload?.error?.message ?? "登入失敗")
        return
      }

      toast.success("登入成功")
      router.push("/dashboard")
    } catch {
      toast.error("系統忙碌，請稍後再試")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface/80 p-8 shadow-(--shadow-soft) backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Analyst Viewpoints
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">內部登入</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          使用帳號密碼登入以存取分析師觀點儀表板。
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
            帳號
            <input
              type="text"
              value={account}
              onChange={event => setAccount(event.target.value)}
              autoComplete="username"
              className="h-11 rounded-2xl border border-border bg-white/80 px-4 text-sm text-ink outline-none transition focus:border-accent"
              placeholder="輸入帳號"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
            密碼
            <input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoComplete="current-password"
              className="h-11 rounded-2xl border border-border bg-white/80 px-4 text-sm text-ink outline-none transition focus:border-accent"
              placeholder="輸入密碼"
            />
          </label>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "登入中..." : "登入"}
          </button>
        </form>
      </div>
    </div>
  )
}
