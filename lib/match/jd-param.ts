import "server-only"

import { parseJobDescription } from "@/lib/match/jd"
import { decodeJdParam } from "@/lib/match/jd-codec"

export { decodeJdParam, encodeJdParam } from "@/lib/match/jd-codec"

export function parseJdParam(raw: string | undefined) {
  const text = decodeJdParam(raw)
  if (!text.trim()) return null
  return { text, signal: parseJobDescription(text) }
}
