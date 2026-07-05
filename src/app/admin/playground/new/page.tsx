import Link from "next/link";
import { redirect } from "next/navigation";
import { isLoggedIn } from "@/features/admin/lib/auth";
import PlaygroundForm from "@/features/admin-playground/components/PlaygroundForm";
import { getPlaygroundMediaOptions } from "@/features/admin-playground/lib/playgroundMediaOptions";

export default async function NewPlaygroundPage() {
  if (!(await isLoggedIn())) redirect("/admin?next=/admin/playground/new");

  const mediaOptions = await getPlaygroundMediaOptions();

  return (
    <main className="wrap mx-auto max-w-[1040px] py-12">
      <Link href="/admin/playground" className="text-[13px] text-inkMuted hover:text-ink">
        ← Playground 목록
      </Link>
      <h1 className="mt-3 font-display text-[26px] font-medium">새 Playground</h1>
      <p className="mt-1 text-[13px] text-muted">
        제목, 내용, 썸네일, 링크를 저장하면 메인 Contact 위에 노출됩니다.
      </p>

      {mediaOptions.length === 0 ? (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-700">
          <code className="font-mono">public/playground</code> 폴더에 GIF, WEBP, PNG 파일을 넣으면 썸네일 목록에 표시됩니다.
        </p>
      ) : null}

      <div className="mt-10">
        <PlaygroundForm mediaOptions={mediaOptions} />
      </div>
    </main>
  );
}
