export function getRequestIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  const raw =
    forwarded?.split(",")[0] ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("fly-client-ip") ||
    "";

  return normalizeIp(raw);
}

function normalizeIp(value: string): string {
  const ip = value.trim();
  if (!ip) return "";
  if (ip.startsWith("[") && ip.includes("]")) return ip.slice(1, ip.indexOf("]"));
  if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) return ip.slice(0, ip.lastIndexOf(":"));
  return ip;
}
