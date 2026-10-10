export const MAX_JD_CHARS = 4000

/** Decodes the shareable `?jd=` param (base64url) into raw JD text. */
export function decodeJdParam(raw: string | undefined): string {
  if (!raw) return ""
  try {
    const base64 = raw.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
    const text =
      typeof Buffer !== "undefined"
        ? Buffer.from(padded, "base64").toString("utf-8")
        : atob(padded)
    return text.slice(0, MAX_JD_CHARS)
  } catch {
    return ""
  }
}

/** Encodes JD text for the `?jd=` param (base64url, no padding). */
export function encodeJdParam(text: string): string {
  const trimmed = text.slice(0, MAX_JD_CHARS)
  const base64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(trimmed, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(trimmed)))
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}
