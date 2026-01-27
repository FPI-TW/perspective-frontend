"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { z } from "zod"
import { ApiError } from "@/lib/api/client"
import type { ViewpointDetailResponse } from "@/lib/api/viewpoints"
import { updateViewpoint } from "@/lib/api/viewpoints"
import type { MarketCode } from "@/lib/markets"
import { joinViewpoints } from "@/lib/text"

const MAX_WORDS = 300

const viewpointSchema = z
  .object({
    points: z.array(z.string()).length(3),
    markCompleted: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const points = joinViewpoints(values.points)
    let totalWords = 0

    for (const point of points) {
      if (!point) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["points"],
          message: "至少輸入一個觀點",
        })
        return
      }

      if (point.length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["points"],
          message: "內容至少 1 字",
        })
      }

      totalWords += point.length
    }

    if (totalWords > MAX_WORDS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["points"],
        message: `內容不可超過 ${MAX_WORDS} 字`,
      })
    }
  })

export type ViewpointFormValues = z.infer<typeof viewpointSchema>

export default function ViewpointEditorForm({
  market,
  detail,
  fileExists,
}: {
  market: MarketCode
  detail: ViewpointDetailResponse
  fileExists: boolean
}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<ViewpointFormValues>({
    resolver: zodResolver(viewpointSchema),
    defaultValues: {
      points: detail.content,
      markCompleted: detail.isCompleted,
    },
  })

  useEffect(() => {
    form.reset({
      points: detail.content,
      markCompleted: detail.isCompleted,
    })
  }, [detail.content, detail.isCompleted, form])

  const mutation = useMutation({
    mutationFn: async (values: ViewpointFormValues) => {
      const points = values.points.map(point => point.trim()).filter(Boolean)
      return updateViewpoint(market, points)
    },
    onSuccess: async () => {
      toast.success("已更新")
      await queryClient.invalidateQueries({
        queryKey: ["viewpoint-detail", market],
      })
      await queryClient.invalidateQueries({
        queryKey: ["viewpoints-status"],
      })
    },
    onError: error => {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          toast.error("請先登入")
          router.push("/login")
          return
        }

        if (error.status === 403) {
          toast.error("無權限")
          return
        }

        if (error.status === 422 && error.details?.length) {
          const fieldError = error.details.find(detailItem => detailItem.field)
          if (fieldError?.field === "content") {
            form.setError("points", {
              message: fieldError.reason ?? "內容有誤",
            })
          }

          if (fieldError?.field === "markCompleted") {
            form.setError("markCompleted", {
              message: fieldError.reason ?? "完成狀態有誤",
            })
          }

          toast.error(error.message)
          return
        }

        toast.error("系統忙碌，請稍後再試")
      }
    },
  })

  const points = useWatch({ control: form.control, name: "points" })
  const markCompleted = useWatch({
    control: form.control,
    name: "markCompleted",
  })
  const secondDisabled = !points?.[0]?.trim()
  const thirdDisabled = !points?.[1]?.trim()
  const pointCounts = [0, 1, 2].map(index => {
    const value = points?.[index] ?? ""
    return value.replace(/\s+/g, "").length
  })
  const totalCount = pointCounts.reduce((sum, count) => sum + count, 0)
  const isOverLimit = totalCount > MAX_WORDS

  const submitLabel = detail.isCompleted
    ? "更新"
    : markCompleted
      ? "提交並完成"
      : "提交"

  const isSubmitDisabled = mutation.isPending || !fileExists

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(
        values => {
          if (!fileExists) {
            toast.error("檔案尚未就緒，請先執行 generate_report.py")
            return
          }
          mutation.mutate(values)
        },
        errors => {
          const errorMessage =
            errors.points?.root?.message ?? errors.markCompleted?.message
          toast.error(errorMessage ?? "內容有誤，請確認後再提交")
        }
      )}
    >
      {!fileExists ? (
        <div className="rounded-2xl border border-border bg-surface/80 p-4 text-sm text-muted shadow-(--shadow-soft)">
          檔案尚未就緒，請先執行 generate_report.py 後再提交。
        </div>
      ) : null}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/80 p-6 shadow-(--shadow-soft)">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              今日觀點
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">
              請輸入 1 - 3 個重點
            </h2>
            <p className="mt-2 text-sm text-muted">
              至少輸入一個觀點，完成後可勾選完成狀態。
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
            <div className="flex items-center justify-between">
              <span>觀點 1</span>
              <span className="text-xs font-medium text-muted">
                {pointCounts[0]} 字
              </span>
            </div>
            <textarea
              rows={5}
              className="min-h-30 rounded-2xl border border-border bg-white/70 p-4 text-sm leading-6 text-ink outline-none transition focus:border-accent"
              placeholder="輸入今日第一個觀點"
              {...form.register("points.0")}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
            <div className="flex items-center justify-between">
              <span>觀點 2</span>
              <span className="text-xs font-medium text-muted">
                {pointCounts[1]} 字
              </span>
            </div>
            <textarea
              rows={5}
              className="min-h-30 rounded-2xl border border-border bg-white/70 p-4 text-sm leading-6 text-ink outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:bg-surface-2"
              placeholder="輸入第二個觀點（可選）"
              disabled={secondDisabled}
              {...form.register("points.1")}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
            <div className="flex items-center justify-between">
              <span>觀點 3</span>
              <span className="text-xs font-medium text-muted">
                {pointCounts[2]} 字
              </span>
            </div>
            <textarea
              rows={5}
              className="min-h-30 rounded-2xl border border-border bg-white/70 p-4 text-sm leading-6 text-ink outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:bg-surface-2"
              placeholder="輸入第三個觀點（可選）"
              disabled={thirdDisabled}
              {...form.register("points.2")}
            />
          </label>
        </div>

        <div
          className={`mt-4 flex items-center justify-end text-sm font-semibold ${
            isOverLimit ? "text-red-600" : "text-muted"
          }`}
        >
          總字數 {totalCount} / {MAX_WORDS}
        </div>

        {form.formState.errors.markCompleted ? (
          <p className="text-sm text-red-600">
            {form.formState.errors.markCompleted.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? "提交中..." : submitLabel}
      </button>
    </form>
  )
}
