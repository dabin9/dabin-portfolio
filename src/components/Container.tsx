import clsx from "clsx";
import type { ElementType, HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  as?: ElementType;
  children: ReactNode;
};

/**
 * 모든 페이지/섹션의 가로 컨테이너.
 * 하나의 최대 폭과 동일한 좌우 여백을 강제해 세로 정렬이 흐트러지지 않게 합니다.
 */
export default function Container({
  as: Tag = "div",
  className,
  children,
  ...rest
}: Props) {
  return (
    <Tag
      className={clsx("mx-auto w-full max-w-[1280px] px-6 md:px-10", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
