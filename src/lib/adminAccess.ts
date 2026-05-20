const LOCAL_DEV_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function hostnameFromHostHeader(host: string | null | undefined) {
  if (!host) return "";
  const normalized = host.trim().toLowerCase();
  if (normalized.startsWith("[")) {
    const end = normalized.indexOf("]");
    return end >= 0 ? normalized.slice(1, end) : normalized;
  }
  return normalized.split(":")[0] ?? "";
}

export function isLocalDevAdminBypassHost(host: string | null | undefined) {
  if (process.env.NODE_ENV !== "development") return false;
  return LOCAL_DEV_HOSTS.has(hostnameFromHostHeader(host));
}
