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
import { joinViewpoints, splitViewpoints } from "@/lib/text"

const viewpointSchema = z
  .object({
    points: z.array(z.string()).length(3),
    markCompleted: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const content = joinViewpoints(values.points)
    const trimmed = content.trim()

    if (!trimmed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["points"],
        message: "至少輸入一個觀點",
      })
      return
    }

    if (trimmed.length < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["points"],
        message: "內容至少 20 字",
      })
    }

    if (trimmed.length > 10000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["points"],
        message: "內容不可超過 10000 字",
      })
    }
  })

export type ViewpointFormValues = z.infer<typeof viewpointSchema>

export default function ViewpointEditorForm({
  market,
  asOfDate,
  detail,
}: {
  market: MarketCode
  asOfDate: string
  detail: ViewpointDetailResponse
}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<ViewpointFormValues>({
    resolver: zodResolver(viewpointSchema),
    defaultValues: {
      points: splitViewpoints(detail.content ?? ""),
      markCompleted: detail.isCompleted,
    },
  })

  useEffect(() => {
    form.reset({
      points: splitViewpoints(detail.content ?? ""),
      markCompleted: detail.isCompleted,
    })
  }, [detail.content, detail.isCompleted, form])

  const mutation = useMutation({
    mutationFn: async (values: ViewpointFormValues) => {
      const content = joinViewpoints(values.points)
      return updateViewpoint(market, {
        asOfDate,
        content,
        markCompleted: values.markCompleted,
      })
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

  const submitLabel = detail.isCompleted
    ? "更新"
    : markCompleted
      ? "提交並完成"
      : "提交"

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(values => mutation.mutate(values))}
    >
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface/80 p-6 shadow-[var(--shadow-soft)]">
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
          <label className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            <input
              type="checkbox"
              className="h-4 w-4 accent-accent"
              {...form.register("markCompleted")}
            />
            完成
          </label>
        </div>

        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
            觀點 1
            <textarea
              rows={5}
              className="min-h-[120px] rounded-2xl border border-border bg-white/70 p-4 text-sm leading-6 text-ink outline-none transition focus:border-accent"
              placeholder="輸入今日第一個觀點"
              {...form.register("points.0")}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
            觀點 2
            <textarea
              rows={5}
              className="min-h-[120px] rounded-2xl border border-border bg-white/70 p-4 text-sm leading-6 text-ink outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:bg-surface-2"
              placeholder="輸入第二個觀點（可選）"
              disabled={secondDisabled}
              {...form.register("points.1")}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-ink">
            觀點 3
            <textarea
              rows={5}
              className="min-h-[120px] rounded-2xl border border-border bg-white/70 p-4 text-sm leading-6 text-ink outline-none transition focus:border-accent disabled:cursor-not-allowed disabled:bg-surface-2"
              placeholder="輸入第三個觀點（可選）"
              disabled={thirdDisabled}
              {...form.register("points.2")}
            />
          </label>
        </div>

        {form.formState.errors.points ? (
          <p className="text-sm text-red-600">
            {form.formState.errors.points.message}
          </p>
        ) : null}
        {form.formState.errors.markCompleted ? (
          <p className="text-sm text-red-600">
            {form.formState.errors.markCompleted.message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {mutation.isPending ? "提交中..." : submitLabel}
      </button>
    </form>
  )
}
