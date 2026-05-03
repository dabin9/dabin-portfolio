/**
 * BlockRenderer — admin 에서 BlockNote 가 변환해 저장한 HTML 을 그대로 렌더한다.
 * 공개 페이지에 BlockNote 번들이 들어가지 않게 하기 위함.
 */
type Props = {
  html?: string;
  className?: string;
};

export default function BlockRenderer({ html, className }: Props) {
  if (!html) return null;
  return (
    <div
      className={"tistory-content " + (className ?? "")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
