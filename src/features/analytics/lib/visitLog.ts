import fs from "node:fs/promises";
import path from "node:path";
import { get, put } from "@vercel/blob";

const VISIT_BLOB_PREFIX = "admin-logs/visits/";
const SECURITY_BLOB_PREFIX = "admin-logs/security/";
const VISIT_LOCAL_DIR = path.join(process.cwd(), ".analytics", "visits");
const SECURITY_LOCAL_DIR = path.join(process.cwd(), ".analytics", "security");
const MAX_ENTRIES = 2000;
const MAX_SECURITY_ENTRIES = 1000;
const KST_TIME_ZONE = "Asia/Seoul";

export type VisitLogEntry = {
  id: string;
  at: string;
  date: string;
  ip: string;
  path: string;
  referrer: string;
  source: string;
  userAgent: string;
};

export type VisitLogSummary = {
  today: string;
  todayVisitors: number;
  todayViews: number;
  totalViews: number;
  daily: Array<{ date: string; visitors: number; views: number }>;
  referrers: Array<{ source: string; count: number; referrer: string }>;
  ips: Array<{ ip: string; count: number; lastSeen: string; paths: string[] }>;
  recent: VisitLogEntry[];
  storage: "blob" | "local" | "unavailable";
  hasBlobToken: boolean;
};

export type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "unauthorized_admin"
  | "unauthorized_api";

export type SecurityLogEntry = {
  id: string;
  at: string;
  date: string;
  type: SecurityEventType;
  ip: string;
  path: string;
  method: string;
  userAgent: string;
  detail: string;
};

export type SecurityLogSummary = {
  todayEvents: number;
  todayFailedLogins: number;
  todayUnauthorized: number;
  recent: SecurityLogEntry[];
};

export async function recordVisit(input: {
  ip: string;
  path: string;
  referrer: string;
  userAgent: string;
}): Promise<void> {
  const now = new Date();
  const entry: VisitLogEntry = {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    at: now.toISOString(),
    date: formatKstDate(now),
    ip: input.ip,
    path: sanitizePath(input.path),
    referrer: sanitizeText(input.referrer, 500),
    source: getSource(input.referrer),
    userAgent: sanitizeText(input.userAgent, 300)
  };

  await writeLogEntryBestEffort("visit", VISIT_BLOB_PREFIX, VISIT_LOCAL_DIR, entry);
}

export async function getVisitLogSummary(): Promise<VisitLogSummary> {
  const entries = await readVisitLogs();
  const today = formatKstDate(new Date());
  const todayEntries = entries.filter((entry) => entry.date === today);
  const todayVisitors = new Set(todayEntries.map((entry) => entry.ip)).size;

  return {
    today,
    todayVisitors,
    todayViews: todayEntries.length,
    totalViews: entries.length,
    daily: summarizeDaily(entries),
    referrers: summarizeReferrers(todayEntries),
    ips: summarizeIps(todayEntries),
    recent: [...entries].reverse().slice(0, 80),
    storage: getStorageMode(),
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN
  };
}

export async function recordSecurityEvent(input: {
  type: SecurityEventType;
  ip: string;
  path: string;
  method: string;
  userAgent: string;
  detail?: string;
}): Promise<void> {
  const now = new Date();
  const entry: SecurityLogEntry = {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    at: now.toISOString(),
    date: formatKstDate(now),
    type: input.type,
    ip: input.ip || "unknown",
    path: sanitizePath(input.path),
    method: sanitizeText(input.method || "GET", 12).toUpperCase(),
    userAgent: sanitizeText(input.userAgent, 300),
    detail: sanitizeText(input.detail || "", 300)
  };

  await writeLogEntryBestEffort(
    "security",
    SECURITY_BLOB_PREFIX,
    SECURITY_LOCAL_DIR,
    entry
  );
}

export async function getSecurityLogSummary(): Promise<SecurityLogSummary> {
  const entries = await readSecurityLogs();
  const today = formatKstDate(new Date());
  const todayEntries = entries.filter((entry) => entry.date === today);

  return {
    todayEvents: todayEntries.length,
    todayFailedLogins: todayEntries.filter((entry) => entry.type === "login_failed")
      .length,
    todayUnauthorized: todayEntries.filter((entry) =>
      entry.type.startsWith("unauthorized")
    ).length,
    recent: [...entries].reverse().slice(0, 80)
  };
}

async function readVisitLogs(): Promise<VisitLogEntry[]> {
  return readLogEntries(VISIT_BLOB_PREFIX, VISIT_LOCAL_DIR, isVisitLogEntry, MAX_ENTRIES);
}

async function readSecurityLogs(): Promise<SecurityLogEntry[]> {
  return readLogEntries(
    SECURITY_BLOB_PREFIX,
    SECURITY_LOCAL_DIR,
    isSecurityLogEntry,
    MAX_SECURITY_ENTRIES
  );
}

async function readLogEntries<T>(
  blobPrefix: string,
  localDir: string,
  guard: (value: unknown) => value is T,
  limit: number
): Promise<T[]> {
  if (useBlobStorage()) {
    return readBlobEntries(blobPrefix, guard, limit);
  }
  if (process.env.VERCEL) return [];

  return readLocalEntries(localDir, guard, limit);
}

async function readBlobEntries<T>(
  prefix: string,
  guard: (value: unknown) => value is T,
  limit: number
): Promise<T[]> {
  const { list } = await import("@vercel/blob");
  const files = await list({ prefix, limit });
  const blobs = files.blobs
    .slice()
    .sort((a, b) => a.pathname.localeCompare(b.pathname))
    .slice(-limit);

  const rows: Array<T | null> = await Promise.all(
    blobs.map(async (blob) => {
      try {
        const file = await get(blob.pathname, { access: "private", useCache: false });
        if (!file?.stream) return null;
        const parsed = JSON.parse(await new Response(file.stream).text()) as unknown;
        return guard(parsed) ? parsed : null;
      } catch {
        return null;
      }
    })
  );

  return rows.filter((row): row is T => !!row);
}

async function readLocalEntries<T>(
  dir: string,
  guard: (value: unknown) => value is T,
  limit: number
): Promise<T[]> {
  try {
    const files = (await collectJsonFiles(dir)).sort().slice(-limit);
    const rows: Array<T | null> = await Promise.all(
      files.map(async (file) => {
        try {
          const parsed = JSON.parse(await fs.readFile(file, "utf8")) as unknown;
          return guard(parsed) ? parsed : null;
        } catch {
          return null;
        }
      })
    );
    return rows.filter((row): row is T => !!row);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLogEntry(
  blobPrefix: string,
  localDir: string,
  entry: VisitLogEntry | SecurityLogEntry
): Promise<void> {
  const body = JSON.stringify(entry, null, 2);
  const filename = `${entry.date}/${entry.id}.json`;

  if (useBlobStorage()) {
    await put(`${blobPrefix}${filename}`, body, {
      access: "private",
      allowOverwrite: false,
      contentType: "application/json",
      cacheControlMaxAge: 60
    });
    return;
  }
  if (process.env.VERCEL) return;

  const target = path.join(localDir, filename);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, body + "\n", "utf8");
}

async function writeLogEntryBestEffort(
  kind: "visit" | "security",
  blobPrefix: string,
  localDir: string,
  entry: VisitLogEntry | SecurityLogEntry
): Promise<void> {
  try {
    await writeLogEntry(blobPrefix, localDir, entry);
  } catch (error) {
    console.error(
      `[analytics] ${kind} log write failed`,
      error instanceof Error ? error.message : error
    );
  }
}

function useBlobStorage() {
  return !!process.env.VERCEL && !!process.env.BLOB_READ_WRITE_TOKEN;
}

function getStorageMode(): VisitLogSummary["storage"] {
  if (useBlobStorage()) return "blob";
  return process.env.VERCEL ? "unavailable" : "local";
}

function isVisitLogEntry(value: unknown): value is VisitLogEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<VisitLogEntry>;
  return (
    typeof entry.at === "string" &&
    typeof entry.date === "string" &&
    typeof entry.ip === "string" &&
    typeof entry.path === "string"
  );
}

function isSecurityLogEntry(value: unknown): value is SecurityLogEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Partial<SecurityLogEntry>;
  return (
    typeof entry.at === "string" &&
    typeof entry.date === "string" &&
    typeof entry.type === "string" &&
    typeof entry.ip === "string" &&
    typeof entry.path === "string"
  );
}

async function collectJsonFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectJsonFiles(fullPath);
      return entry.isFile() && entry.name.endsWith(".json") ? [fullPath] : [];
    })
  );
  return files.flat();
}

function summarizeDaily(entries: VisitLogEntry[]) {
  const map = new Map<string, { ips: Set<string>; views: number }>();
  for (const entry of entries) {
    const row = map.get(entry.date) ?? { ips: new Set<string>(), views: 0 };
    row.ips.add(entry.ip);
    row.views += 1;
    map.set(entry.date, row);
  }

  return [...map.entries()]
    .map(([date, row]) => ({ date, visitors: row.ips.size, views: row.views }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);
}

function summarizeReferrers(entries: VisitLogEntry[]) {
  const map = new Map<string, { count: number; referrer: string }>();
  for (const entry of entries) {
    const row = map.get(entry.source) ?? { count: 0, referrer: entry.referrer };
    row.count += 1;
    if (!row.referrer && entry.referrer) row.referrer = entry.referrer;
    map.set(entry.source, row);
  }

  return [...map.entries()]
    .map(([source, row]) => ({ source, count: row.count, referrer: row.referrer }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
}

function summarizeIps(entries: VisitLogEntry[]) {
  const map = new Map<string, { count: number; lastSeen: string; paths: Set<string> }>();
  for (const entry of entries) {
    const row = map.get(entry.ip) ?? {
      count: 0,
      lastSeen: entry.at,
      paths: new Set<string>()
    };
    row.count += 1;
    row.paths.add(entry.path);
    if (entry.at > row.lastSeen) row.lastSeen = entry.at;
    map.set(entry.ip, row);
  }

  return [...map.entries()]
    .map(([ip, row]) => ({
      ip,
      count: row.count,
      lastSeen: row.lastSeen,
      paths: [...row.paths].slice(0, 4)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}

function formatKstDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function getSource(referrer: string): string {
  if (!referrer) return "Direct";
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Unknown";
  }
}

function sanitizePath(value: string): string {
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return "/";
  return sanitizeText(path, 300);
}

function sanitizeText(value: string, max: number): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
}

export function formatKstDateTime(value: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatSecurityEventType(type: SecurityEventType): string {
  const labels: Record<SecurityEventType, string> = {
    login_success: "로그인 성공",
    login_failed: "로그인 실패",
    unauthorized_admin: "관리자 접근 차단",
    unauthorized_api: "관리자 API 접근 차단"
  };
  return labels[type];
}
