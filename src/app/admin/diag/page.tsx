import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";

/**
 * Admin 환경 진단 페이지.
 * 어떤 env 가 빠졌는지, 어떤 흐름이 작동하는지 한눈에.
 */
export default async function AdminDiagPage() {
  if (!(await isLoggedIn())) redirect("/admin?next=/admin/diag");

  const blob = process.env.BLOB_READ_WRITE_TOKEN || "";
  const gh = process.env.GITHUB_TOKEN || "";

  const checks: { label: string; ok: boolean; hint?: string; value?: string }[] = [
    {
      label: "ADMIN_PASSWORD",
      ok: !!process.env.ADMIN_PASSWORD,
      hint: "비밀번호 — 비어있으면 로그인 자체가 안됨"
    },
    {
      label: "ADMIN_SECRET",
      ok: !!process.env.ADMIN_SECRET,
      hint: "쿠키 서명용 (선택, 없으면 비밀번호 자체를 secret 으로 사용)"
    },
    {
      label: "BLOB_READ_WRITE_TOKEN",
      ok: !!blob,
      value: blob ? `set · prefix ${blob.slice(0, 14)}…` : "MISSING",
      hint: "이미지 업로드 (Vercel Blob 직접 업로드). Vercel → Storage → Blob 만들면 자동 주입"
    },
    {
      label: "GITHUB_TOKEN",
      ok: !!gh,
      value: gh ? `set · prefix ${gh.slice(0, 8)}…` : "MISSING",
      hint: "작업물 저장 (GitHub Contents API commit). PAT 의 repo scope 필요"
    },
    {
      label: "GITHUB_OWNER",
      ok: !!process.env.GITHUB_OWNER,
      value: process.env.GITHUB_OWNER || "MISSING",
      hint: "예: dabin9"
    },
    {
      label: "GITHUB_REPO",
      ok: !!process.env.GITHUB_REPO,
      value: process.env.GITHUB_REPO || "MISSING",
      hint: "예: dabin"
    },
    {
      label: "GITHUB_BRANCH",
      ok: true,
      value: process.env.GITHUB_BRANCH || "main (default)"
    }
  ];

  const allOk = checks.every((c) => c.ok);

  return (
    <main className="wrap py-12 max-w-[820px] mx-auto">
      <Link href="/admin/projects" className="text-[13px] text-inkMuted hover:text-ink">
        ← 작업물 목록
      </Link>
      <h1 className="mt-3 font-display font-medium text-[26px]">환경 진단</h1>
      <p className="mt-1 text-[13px] text-muted">
        Vercel 에 올린 환경변수 / 토큰이 모두 살아있는지 확인합니다.
      </p>

      <div
        className={
          "mt-8 rounded-md border px-4 py-3 text-[13px] " +
          (allOk
            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
            : "bg-amber-50 border-amber-200 text-amber-800")
        }
      >
        {allOk
          ? "✓ 모든 환경변수 정상 — 업로드/저장 흐름이 동작해야 합니다."
          : "⚠ 누락된 환경변수가 있어요. 아래 표에서 MISSING 항목을 채우고 Vercel 을 재배포하세요."}
      </div>

      <table className="mt-6 w-full border border-line text-[13px]">
        <thead>
          <tr className="bg-surface text-muted">
            <th className="text-left px-3 py-2 font-normal">변수</th>
            <th className="text-left px-3 py-2 font-normal">상태</th>
            <th className="text-left px-3 py-2 font-normal">설명</th>
          </tr>
        </thead>
        <tbody>
          {checks.map((c) => (
            <tr key={c.label} className="border-t border-line">
              <td className="px-3 py-2 font-mono">{c.label}</td>
              <td className="px-3 py-2">
                <span
                  className={
                    "inline-block px-2 py-0.5 rounded text-[11px] font-mono " +
                    (c.ok
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200")
                  }
                >
                  {c.value ?? (c.ok ? "set" : "MISSING")}
                </span>
              </td>
              <td className="px-3 py-2 text-inkMuted">{c.hint ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-10 space-y-6">
        <Section title="이미지 업로드 흐름">
          <p>
            1) 클라이언트 → <code className="font-mono text-ink">@vercel/blob/client</code>{" "}
            <code className="font-mono">upload()</code>
          </p>
          <p>
            2) <code className="font-mono text-ink">/api/admin/blob-token</code> 가 토큰 발급
            (BLOB_READ_WRITE_TOKEN 필요)
          </p>
          <p>3) 브라우저가 Blob 스토어로 직접 PUT — 함수 본문 4.5MB 한도 우회</p>
          <p className="text-[12px] text-muted pt-1">
            토큰이 없으면 <code className="font-mono">/api/admin/upload</code> 로 fallback (4MB 제한)
          </p>
        </Section>

        <Section title="작업물 저장 흐름">
          <p>1) 폼 submit → server action</p>
          <p>
            2) <code className="font-mono text-ink">src/data/projects.json</code> 을 GitHub
            Contents API 로 commit
          </p>
          <p>3) GitHub push → Vercel 자동 재배포 (~30초)</p>
        </Section>

        <Section title="문제 해결 가이드">
          <p>
            <b>BLOB_READ_WRITE_TOKEN MISSING</b> — Vercel 대시보드 → 프로젝트 → Storage 탭 →
            Create → Blob → 이름 정하기. 만들면 환경변수 자동 주입됨. 그 다음 Deployments 에서 재배포.
          </p>
          <p>
            <b>GITHUB_TOKEN MISSING</b> — github.com/settings/tokens → Generate new token (classic)
            → repo scope → 발급. Vercel env 에 추가 + 재배포.
          </p>
          <p>
            <b>여전히 안되면</b> — 브라우저 콘솔에서 <code className="font-mono">[upload]</code>{" "}
            로그를 찾아 정확한 에러 메시지를 알려주세요.
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display font-medium text-[15px] mb-2">{title}</h2>
      <div className="text-[13px] text-inkMuted space-y-1.5 leading-relaxed">{children}</div>
    </div>
  );
}
