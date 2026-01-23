# Frontend Spec — Analyst Viewpoints Dashboard

> 目的：提供內部用 Dashboard，呈現八個市場「分析師觀點是否已完成」；並提供各市場輸入頁可手動更新觀點。  
> 技術：Next.js（App Router）、TypeScript、@tanstack/react-query（useQuery/useMutation）、Tailwind CSS、shadcn/ui、React Hook Form、Zod、react/motion
> 權限：登入/權限在 Next.js Server Side 簡單處理  
> 非功能：RWD 必備；不做 i18n

---

## 1. 功能範圍

### 1.1 Dashboard（/dashboard）

- 顯示 8 個市場的觀點完成狀態（Completed / Pending）
- 顯示最後更新時間與更新者
- 顯示摘要
- 點擊市場卡片導到該市場輸入頁 `/viewpoints/[market]`
- 篩選（可選）：全部 / 已完成 / 未完成

### 1.2 市場輸入/更新頁（/viewpoints/[market]）

- 顯示該市場當日（或選定日期）的狀態與最新內容
- 允許手動提交/更新觀點
- 可勾選 markCompleted 以將 Pending → Completed
- 提交成功後更新本頁資料，並確保回到 dashboard 狀態一致

---

## 2. 八個市場（固定清單）

> market code 先暫定如下（若未來變動，集中在 `MARKETS` 設定檔調整）

- US_MACRO（美國總經/債市）
- US_EQUITY（美股）
- TW_EQUITY（台股）
- HK_EQUITY（港股）
- CN_EQUITY（陸股）
- FX（外匯）
- CRYPTO（加密）
- TW_FUTURES（台灣期貨/選擇權）

---

## 3. 路由與頁面

### 3.1 路由

- `/dashboard`
- `/viewpoints/[market]`

### 3.2 導覽

- Dashboard 卡片點擊 → `/viewpoints/US_MACRO`（依 market code）
- 輸入頁提供「返回 Dashboard」按鈕

---

## 4. 權限與登入（Server Side 簡化）

> 內部工具：不做複雜 RBAC；以 Server Side guard 為主。

### 4.1 Guard 規則

- 在 App Router 的 layout 或 page server component 中檢查：
  - 是否存在 session cookie 或內部 header（例如 `x-internal-auth` / `session`）
- 不通過：
  - redirect `/login`，或
  - 回傳 403（依你現有內部流程）

### 4.2 API 回應處理（前端）

- 401：導到 `/login`（或 toast 後導頁）
- 403：顯示「無權限」提示（toast + fallback UI）

---

## 5. API 串接規格（先暫定建議版；以列點描述，不用 JSON）

### 5.1 取得 Dashboard 狀態（八市場總覽）

- Method：GET
- Path：`/v1/viewpoints/status`
- Query：
  - `date`（可選，格式 `YYYY-MM-DD`；未提供則預設今天）
- Response（200）欄位：
  - `asOfDate`: `YYYY-MM-DD`
  - `items`: Array
    - `market`: MarketCode
    - `isCompleted`: boolean
    - `lastUpdatedAt`: ISO string 或 null
    - `lastUpdatedBy`: `{ id: string; name: string }` 或 null
    - `summary`: string（可選）

### 5.2 取得某市場最新觀點

- Method：GET
- Path：`/v1/viewpoints/{market}`
- Path param：
  - `market`: MarketCode
- Query：
  - `date`（可選，格式 `YYYY-MM-DD`；未提供則預設今天）
- Response（200）欄位：
  - `market`: MarketCode
  - `asOfDate`: `YYYY-MM-DD`
  - `isCompleted`: boolean
  - `content`: string（可為空字串）
  - `lastUpdatedAt`: ISO string 或 null
  - `lastUpdatedBy`: `{ id: string; name: string }` 或 null

### 5.3 更新/提交觀點

- Method：PUT
- Path：`/v1/viewpoints/{market}`
- Path param：
  - `market`: MarketCode
- Request body 欄位：
  - `asOfDate`: `YYYY-MM-DD`
  - `content`: string
  - `markCompleted`: boolean
- Response（200）欄位（最小集）：
  - `market`: MarketCode
  - `asOfDate`: `YYYY-MM-DD`
  - `isCompleted`: boolean
  - `lastUpdatedAt`: ISO string
  - `lastUpdatedBy`: `{ id: string; name: string }`

### 5.4 錯誤格式（統一）

- Response（非 2xx）欄位：
  - `error.code`: string（例：`VALIDATION_ERROR` / `UNAUTHORIZED` / `FORBIDDEN`）
  - `error.message`: string
  - `error.details`:（可選）Array
    - `field`: string（可選）
    - `reason`: string（可選）

---

## 6. 資料抓取與狀態管理（React Query）

> 原則：Client Components 使用 `useQuery`/`useMutation`；Server Side guard 只負責保護頁面。

### 6.1 Query Keys（建議）

- `["viewpoints-status", asOfDate]`
- `["viewpoint-detail", market, asOfDate]`

### 6.2 Dashboard

- 進 `/dashboard`：
  - useQuery 取得 status
  - loading：顯示 skeleton grid
  - error：顯示 error state + 重試按鈕

### 6.3 Detail + Submit

- 進 `/viewpoints/[market]`：
  - useQuery 取得 detail
- 提交：
  - useMutation 呼叫 PUT
  - 成功後 invalidate：
    - `["viewpoint-detail", market, asOfDate]`
    - `["viewpoints-status", asOfDate]`（確保 dashboard 一致）

---

## 7. UI 規格（Tailwind + shadcn/ui）

### 7.1 Dashboard Layout（RWD 必備）

- Desktop：4 欄 x 2 列卡片
- Tablet：2 欄
- Mobile：1 欄
- 建議 class：
  - `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`

### 7.2 MarketStatusCard（卡片內容）

- 市場名稱（Label）
- 狀態 Badge：
  - Completed / Pending（視覺區分）
- 最後更新：
  - `lastUpdatedAt = null` → 顯示「尚未更新」
  - 否則顯示相對時間 + tooltip 顯示絕對時間（可選）
- 更新者（若有才顯示）
- 摘要（可選，最多顯示 250 字，超過省略）

### 7.3 輸入頁 Editor（shadcn/ui 建議元件）

- Card / Button / Badge / Textarea / Checkbox / Separator / Skeleton / Toast（或 Sonner）
- 欄位：
  - 共三個欄位，可輸入最少一個、最多三個觀點
  - content（Textarea，rows 14~18）
  - markCompleted（Checkbox）
- 按鈕文案建議：
  - Pending：`提交` 或 `提交並完成`
  - Completed：`更新`

---

## 8. 表單驗證與 UX

### 8.1 驗證規則（建議）

- content：必填（trim 後）
- content 最小長度：>= 20
- content 最大長度：<= 10,000
- markCompleted = true 時 content 必須通過驗證

### 8.2 錯誤呈現

- 422 / VALIDATION_ERROR：
  - 若 `error.details[].field` 存在 → 顯示在對應欄位下方
  - 同時 toast 顯示簡短 message
- 500：
  - toast 顯示「系統忙碌，請稍後再試」
  - 不清空使用者輸入

---

## 9. API Client 規範（lib/api/client.ts）

### 9.1 環境變數

- `NEXT_PUBLIC_API_BASE_URL`

### 9.2 apiFetch 行為（建議）

- 統一加上 baseURL
- 同網域可用 `credentials: "include"`（依你的登入策略）
- 非 2xx：
  - 解析為 ApiError（或丟出可辨識錯誤）
- 不在底層 fetch 內強制 redirect（避免不同頁行為不一致）
  - 將 401/403 交給頁面層決定

---

## 10. 組件清單（建議拆分）

### `/dashboard`

- `DashboardPage`（Client）
- `FiltersBar`（可選）
- `MarketStatusGrid`
- `MarketStatusCard`
- `DashboardSkeleton`

### `/viewpoints/[market]`

- `ViewpointPage`（Client）
- `ViewpointHeader`
- `ViewpointMeta`（狀態、最後更新）
- `ViewpointEditorForm`
- `ViewpointSkeleton`

---

## 11. 驗收條件（Acceptance Criteria）

### Dashboard

- 能看到 8 個市場卡片（RWD：手機 1 欄、桌機 4 欄）
- 每張卡片正確顯示 isCompleted、lastUpdatedAt、lastUpdatedBy（若 null 正確隱藏/替代）
- 點擊卡片可進對應市場頁

### 輸入/更新

- 進 `/viewpoints/[market]` 能載入該市場 detail
- content 驗證不通過會提示
- 三個輸入欄位，並依照條件阻擋為輸入的狀態
- 提交成功後本頁狀態更新，並 invalidate dashboard query
- API 401/403 能正確提示並導頁或顯示無權限

---
