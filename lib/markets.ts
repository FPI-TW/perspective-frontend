export const MARKET_CODES = [
  "us_macro",
  "forex",
  "crypto",
  "us_stocks",
  "hk_stocks",
  "cn_stocks",
  "tw_stocks",
  "tw_futures",
] as const

export type MarketCode = (typeof MARKET_CODES)[number]

export const SUMMARY_KEYS = [
  "us_macro",
  "forex",
  "crypto",
  "us_stocks",
  "hk_stocks",
  "cn_stocks",
  "tw_stocks",
  "tw_futures",
] as const

export type SummaryKey = (typeof SUMMARY_KEYS)[number]

export const MARKET_LABELS: Record<MarketCode, string> = {
  us_macro: "美國宏觀及債券市場",
  forex: "全球外匯市場",
  crypto: "加密貨幣市場",
  us_stocks: "美股市場",
  hk_stocks: "港股市場",
  cn_stocks: "陸股市場",
  tw_stocks: "台股市場",
  tw_futures: "台指期權市場",
}

export const MARKET_SUMMARY_KEYS: Record<MarketCode, SummaryKey> = {
  us_macro: "us_macro",
  forex: "forex",
  crypto: "crypto",
  us_stocks: "us_stocks",
  hk_stocks: "hk_stocks",
  cn_stocks: "cn_stocks",
  tw_stocks: "tw_stocks",
  tw_futures: "tw_futures",
}

export const MARKETS = MARKET_CODES.map(code => ({
  code,
  label: MARKET_LABELS[code],
  summaryKey: MARKET_SUMMARY_KEYS[code],
}))

export function isMarketCode(value: string): value is MarketCode {
  return MARKET_CODES.some(code => code === value)
}
