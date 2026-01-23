import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface/80 p-8 shadow-[var(--shadow-soft)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
          Analyst Viewpoints
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">需要內部登入</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          請確認已完成公司內部登入或注入 session cookie，再重新整理此頁面。
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-white transition hover:brightness-95"
          >
            重新嘗試
          </Link>
          <span className="text-xs text-muted">
            若仍無法存取，請聯繫系統管理員。
          </span>
        </div>
      </div>
    </div>
  )
}
