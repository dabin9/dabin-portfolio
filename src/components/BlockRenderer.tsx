/**
 * BlockRenderer — admin 에서 BlockNote 가 변환해 저장한 HTML 을 그대로 렌더한다.
 * 공개 페이지에 BlockNote 번들이 들어가지 않게 하기 위함.
 */
import { stripEmptyBlockNoteBlocks } from "@/lib/blocknoteHtml";

type Props = {
  html?: string;
  className?: string;
};

export default function BlockRenderer({ html, className }: Props) {
  const cleanedHtml = html ? stripEmptyBlockNoteBlocks(html) : "";
  if (!cleanedHtml) return null;
  return (
    <div
      className={"rich-content blocknote-content " + (className ?? "")}
      dangerouslySetInnerHTML={{ __html: cleanedHtml }}
    />
  );
}
