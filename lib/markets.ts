export const MARKET_CODES = [
  "US_MACRO",
  "US_EQUITY",
  "TW_EQUITY",
  "HK_EQUITY",
  "CN_EQUITY",
  "FX",
  "CRYPTO",
  "TW_FUTURES",
] as const

export type MarketCode = (typeof MARKET_CODES)[number]

export const MARKET_LABELS: Record<MarketCode, string> = {
  US_MACRO: "美國總經/債市",
  US_EQUITY: "美股",
  TW_EQUITY: "台股",
  HK_EQUITY: "港股",
  CN_EQUITY: "陸股",
  FX: "外匯",
  CRYPTO: "加密",
  TW_FUTURES: "台灣期貨/選擇權",
}

export const MARKETS = MARKET_CODES.map(code => ({
  code,
  label: MARKET_LABELS[code],
}))

export function isMarketCode(value: string): value is MarketCode {
  return MARKET_CODES.some(code => code === value)
}
