"use client";

import { useState, type ReactNode } from "react";
import type { ProjectCaseNote } from "@/entities/project";
import BlockEditor from "../BlockEditorLazy";
import type { BlockEditorHandle } from "../BlockEditor";
import { DetailSectionLabel } from "./FormControls";
import { fieldInitialHtml } from "./projectFormUtils";

export function CaseNotesEditor({
  defaultItems,
  contribution,
  registerEditor
}: {
  defaultItems: ProjectCaseNote[];
  contribution: number;
  registerEditor: (key: string, handle: BlockEditorHandle | null) => void;
}) {
  const [items, setItems] = useState<ProjectCaseNote[]>(
    defaultItems.length > 0
      ? defaultItems
      : [{ issueTitle: "", problem: "", approach: "", result: "" }]
  );

  function addItem() {
    setItems((current) => [
      ...current,
      { issueTitle: "", problem: "", approach: "", result: "" }
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  return (
    <section className="mt-14 grid md:grid-cols-12 gap-8">
      <DetailSectionLabel title="Case Notes" />
      <div className="md:col-span-9 space-y-5">
        {items.map((item, idx) => (
          <div key={idx} className="border-t border-line pt-5">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[12px] uppercase text-muted">
                Case {String(idx + 1).padStart(2, "0")}
              </p>
              {items.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-[12px] text-red-600 hover:underline underline-offset-4"
                >
                  삭제
                </button>
              ) : null}
            </div>
            <dl className="mt-3 space-y-3 text-[15px] md:text-[16px] leading-8">
              <CaseInputRow label="고민했던 부분">
                <div className="space-y-3">
                  <div>
                    <span className="mb-1 block font-mono text-[11px] uppercase text-muted">
                      타이틀
                    </span>
                    <BlockEditor
                      ref={(handle) => registerEditor(`case-${idx}-issue-title`, handle)}
                      blocksFieldName="caseIssueTitleBlocks"
                      htmlFieldName="caseIssueTitleHtml"
                      initialHtml={fieldInitialHtml(item.issueTitleHtml, item.issueTitle)}
                      compact
                      hideHelp
                    />
                  </div>
                  <div className="border-t border-line pt-3">
                    <span className="mb-1 block font-mono text-[11px] uppercase text-muted">
                      이슈사항
                    </span>
                    <BlockEditor
                      ref={(handle) => registerEditor(`case-${idx}-problem`, handle)}
                      blocksFieldName="caseProblemBlocks"
                      htmlFieldName="caseProblemHtml"
                      initialHtml={fieldInitialHtml(item.problemHtml, item.problem)}
                      compact
                      hideHelp
                    />
                  </div>
                </div>
              </CaseInputRow>
              <CaseInputRow label="시도 방안">
                <BlockEditor
                  ref={(handle) => registerEditor(`case-${idx}-approach`, handle)}
                  blocksFieldName="caseApproachBlocks"
                  htmlFieldName="caseApproachHtml"
                  initialHtml={fieldInitialHtml(item.approachHtml, item.approach)}
                  compact
                  hideHelp
                />
              </CaseInputRow>
              <CaseInputRow label="결과">
                <BlockEditor
                  ref={(handle) => registerEditor(`case-${idx}-result`, handle)}
                  blocksFieldName="caseResultBlocks"
                  htmlFieldName="caseResultHtml"
                  initialHtml={fieldInitialHtml(
                    item.resultHtml,
                    item.result ||
                      `${contribution}% 기여 범위에서 구현과 정리를 완료한 항목입니다.`
                  )}
                  compact
                  hideHelp
                />
              </CaseInputRow>
            </dl>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="border border-line px-3 py-2 text-[12px] text-inkMuted hover:border-ink hover:text-ink transition"
        >
          + Case 추가
        </button>
      </div>
    </section>
  );
}

export function ResultItemsEditor({
  defaultItems,
  registerEditor
}: {
  defaultItems: string[];
  registerEditor: (key: string, handle: BlockEditorHandle | null) => void;
}) {
  const [items, setItems] = useState<string[]>(
    defaultItems.length > 0 ? defaultItems : [""]
  );

  function addItem() {
    setItems((current) => [...current, ""]);
  }

  function removeItem(index: number) {
    setItems((current) => current.filter((_, i) => i !== index));
  }

  return (
    <section className="mt-14 grid md:grid-cols-12 gap-8">
      <DetailSectionLabel title="Result" />
      <div className="md:col-span-9 space-y-5">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[auto_1fr_auto] gap-5 items-start border-t border-line pt-5"
          >
            <span className="font-mono text-[13px] text-brand tabular-nums">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <div className="w-full min-w-0">
              <BlockEditor
                ref={(handle) => registerEditor(`result-${idx}`, handle)}
                htmlFieldName="resultItems"
                blocksFieldName="resultBlocks"
                initialHtml={fieldInitialHtml(undefined, item)}
                compact
                hideHelp
              />
            </div>
            {items.length > 1 ? (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-[12px] text-red-600 hover:underline underline-offset-4"
              >
                삭제
              </button>
            ) : null}
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="border border-line px-3 py-2 text-[12px] text-inkMuted hover:border-ink hover:text-ink transition"
        >
          + Result 추가
        </button>
      </div>
    </section>
  );
}

function CaseInputRow({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid md:grid-cols-[96px_1fr] gap-1 md:gap-4">
      <dt className="font-mono text-[11px] uppercase text-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
