export const INTERNAL_ANALYTICS_HEADER = "x-dabin-internal-analytics";

export function getInternalAnalyticsToken(): string {
  const secret = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
  return secret ? `dabin:${encodeURIComponent(secret)}` : "";
}

export function hasInternalAnalyticsToken(headers: Headers): boolean {
  const token = getInternalAnalyticsToken();
  return !!token && headers.get(INTERNAL_ANALYTICS_HEADER) === token;
}
