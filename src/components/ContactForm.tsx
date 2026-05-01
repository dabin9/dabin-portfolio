"use client";

import { useMemo, useState, type FormEvent } from "react";
import { env } from "@/lib/env";

type Intent = "hire" | "project" | "chat" | "other";

const intents: { value: Intent; label: string; hint: string }[] = [
  { value: "hire", label: "정규직 채용", hint: "포지션 · 팀 · 시작 가능 시점을 함께 알려주세요." },
  { value: "project", label: "프로젝트 / 외주", hint: "기간 · 범위 · 예상 일정을 적어주세요." },
  { value: "chat", label: "커피챗 / 멘토링", hint: "편한 대화, 언제든 환영합니다." },
  { value: "other", label: "기타", hint: "어떤 이야기든 좋습니다." }
];

export default function ContactForm() {
  const [intent, setIntent] = useState<Intent>("hire");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subjectMap: Record<Intent, string> = {
    hire: "[채용 문의]",
    project: "[프로젝트 문의]",
    chat: "[커피챗 제안]",
    other: "[기타 문의]"
  };

  const mailtoHref = useMemo(() => {
    const subject = `${subjectMap[intent]} ${name || "문의"}`.trim();
    const body = [
      `이름 · ${name || "(미입력)"}`,
      `소속 · ${org || "(미입력)"}`,
      `회신 이메일 · ${email || "(미입력)"}`,
      "",
      "— 본문 —",
      message || "(내용을 작성해 주세요)"
    ].join("\n");
    const params = new URLSearchParams({ subject, body });
    return `mailto:${env.email}?${params.toString()}`;
  }, [intent, name, org, email, message]);

  const currentHint = intents.find((i) => i.value === intent)?.hint ?? "";

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.location.href = mailtoHref;
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="mt-10 md:mt-14 grid md:grid-cols-12 gap-y-8 md:gap-x-10"
    >
      {/* Intent */}
      <fieldset className="md:col-span-12">
        <legend className="text-[13px] text-muted mb-3">문의 유형</legend>
        <div className="flex flex-wrap gap-2">
          {intents.map((opt) => {
            const active = opt.value === intent;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setIntent(opt.value)}
                aria-pressed={active}
                className={
                  "px-4 py-2 text-[13px] border transition " +
                  (active
                    ? "bg-ink text-bg border-ink"
                    : "bg-bg text-inkSoft border-line hover:border-ink hover:text-ink")
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[13px] text-muted">{currentHint}</p>
      </fieldset>

      <Field label="이름" htmlFor="name" className="md:col-span-6">
        <input
          id="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
          className="input"
        />
      </Field>

      <Field label="소속 (선택)" htmlFor="org" className="md:col-span-6">
        <input
          id="org"
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          placeholder="회사 · 팀"
          className="input"
        />
      </Field>

      <Field label="회신 이메일" htmlFor="email" className="md:col-span-12">
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="input"
        />
      </Field>

      <Field label="내용" htmlFor="message" className="md:col-span-12">
        <textarea
          id="message"
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={7}
          placeholder="포지션/프로젝트 설명, 일정, 기대사항 등을 자유롭게 적어주세요."
          className="input resize-y min-h-[160px]"
        />
      </Field>

      <div className="md:col-span-12 flex items-center justify-between gap-4 flex-wrap pt-2">
        <p className="text-[13px] text-muted max-w-[52ch]">
          전송 시 기본 메일 클라이언트로 내용이 전달됩니다. 답장은 보통 1 영업일 내에 드립니다.
        </p>
        <button
          type="submit"
          className="group inline-flex items-center gap-2 bg-ink text-bg pl-5 pr-4 py-3 text-[13px] hover:bg-accent transition-colors"
        >
          {submitted ? "메일 클라이언트로 이동됨" : "문의 보내기"}
          <span aria-hidden className="inline-block transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          background: transparent;
          border: 0;
          border-bottom: 1px solid #e4e2db;
          padding: 12px 2px;
          font-size: 16px;
          color: #0a0a0a;
          outline: none;
          transition: border-color 200ms ease;
          font-family: inherit;
        }
        .input::placeholder {
          color: #a09c91;
        }
        .input:focus {
          border-color: #0a0a0a;
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="text-[13px] text-muted block mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
