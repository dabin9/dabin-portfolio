import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/features/admin/lib/auth";
import {
  formatKstDateTime,
  formatSecurityEventType,
  getSecurityLogSummary,
  getVisitLogSummary
} from "@/features/analytics/lib/visitLog";

export const dynamic = "force-dynamic";

export default async function AdminLogPage() {
  if (!(await isLoggedIn())) redirect("/admin?next=/admin/log");

  const summary = await getVisitLogSummary();
  const security = await getSecurityLogSummary();

  return (
    <main className="wrap py-12 max-w-[1200px] mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/projects" className="text-[13px] text-inkMuted hover:text-ink">
            ← 작업물 목록
          </Link>
          <p className="mt-5 text-[12px] tracking-[0.4em] text-muted uppercase">
            Admin
          </p>
          <h1 className="mt-2 font-display font-medium text-[26px]">방문 로그</h1>
          <p className="mt-1 text-[13px] text-muted">
            관리자 로그인 세션과 로그인 IP는 제외하고 기록합니다.
          </p>
        </div>
        <div className="text-right text-[12px] text-muted">
          <p>기준일 {summary.today} KST</p>
          <p>
            저장소 {getStorageLabel(summary.storage)}
            {!summary.hasBlobToken ? " · Blob token 없음" : null}
          </p>
        </div>
      </div>

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="오늘 방문자" value={summary.todayVisitors} suffix="명" />
        <Metric label="오늘 방문 수" value={summary.todayViews} suffix="회" />
        <Metric label="누적 방문자" value={summary.totalVisitors} suffix="명" />
        <Metric label="저장된 전체 로그" value={summary.totalViews} suffix="건" />
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric label="오늘 보안 이벤트" value={security.todayEvents} suffix="건" />
        <Metric label="로그인 실패" value={security.todayFailedLogins} suffix="건" />
        <Metric label="비정상 접근" value={security.todayUnauthorized} suffix="건" />
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <Panel title="월별 방문자">
          <Table
            empty="아직 기록된 방문이 없습니다."
            headers={["월", "방문자", "방문 수"]}
            rows={summary.monthly.map((row) => [
              row.month,
              `${row.visitors}명`,
              `${row.views}회`
            ])}
          />
        </Panel>

        <Panel title="일별 방문자">
          <Table
            empty="아직 기록된 방문이 없습니다."
            headers={["날짜", "방문자", "방문 수"]}
            rows={summary.daily.map((row) => [
              row.date,
              `${row.visitors}명`,
              `${row.views}회`
            ])}
          />
        </Panel>
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <Panel title="오늘 유입경로">
          <Table
            empty="오늘 유입 기록이 없습니다."
            headers={["유입", "방문 수", "원본"]}
            rows={summary.referrers.map((row) => [
              row.source,
              `${row.count}회`,
              row.referrer || "-"
            ])}
          />
        </Panel>

        <Panel title="오늘 들어온 IP">
          <Table
            empty="오늘 IP 기록이 없습니다."
            headers={["IP", "방문 수", "마지막 방문", "경로"]}
            rows={summary.ips.map((row) => [
              row.ip,
              `${row.count}회`,
              formatKstDateTime(row.lastSeen),
              row.paths.join(", ")
            ])}
          />
        </Panel>
      </section>

      <section className="mt-10">
        <Panel title="최근 보안 로그">
          <Table
            empty="아직 보안 이벤트가 없습니다."
            headers={["시간", "이벤트", "IP", "경로", "상세"]}
            rows={security.recent.map((row) => [
              formatKstDateTime(row.at),
              formatSecurityEventType(row.type),
              row.ip,
              `${row.method} ${row.path}`,
              row.detail || "-"
            ])}
          />
        </Panel>
      </section>

      <section className="mt-10">
        <Panel title="최근 로그">
          <Table
            empty="아직 기록된 방문 로그가 없습니다."
            headers={["시간", "IP", "경로", "유입"]}
            rows={summary.recent.map((row) => [
              formatKstDateTime(row.at),
              row.ip,
              row.path,
              row.source
            ])}
          />
        </Panel>
      </section>
    </main>
  );
}

function getStorageLabel(storage: "blob" | "local" | "unavailable") {
  if (storage === "blob") return "Vercel Blob";
  if (storage === "local") return "local file";
  return "기록 비활성";
}

function Metric({
  label,
  value,
  suffix
}: {
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div className="border border-line bg-surface px-4 py-4">
      <p className="font-mono text-[11px] uppercase text-muted">{label}</p>
      <p className="mt-3 font-display text-[32px] leading-none text-ink">
        {value}
        <span className="ml-1 align-baseline font-mono text-[12px] text-muted">
          {suffix}
        </span>
      </p>
    </div>
  );
}

function Panel({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display font-medium text-[17px]">{title}</h2>
      <div className="mt-3 overflow-x-auto border border-line">{children}</div>
    </div>
  );
}

function Table({
  headers,
  rows,
  empty
}: {
  headers: string[];
  rows: string[][];
  empty: string;
}) {
  return (
    <table className="w-full min-w-[560px] text-[13px]">
      <thead>
        <tr className="bg-surface text-muted">
          {headers.map((header) => (
            <th key={header} className="px-3 py-2 text-left font-normal">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length > 0 ? (
          rows.map((row, index) => (
            <tr key={index} className="border-t border-line align-top">
              {row.map((cell, cellIndex) => (
                <td
                  key={`${index}-${cellIndex}`}
                  className="max-w-[360px] break-words px-3 py-2 text-inkMuted"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr className="border-t border-line">
            <td className="px-3 py-6 text-center text-muted" colSpan={headers.length}>
              {empty}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
