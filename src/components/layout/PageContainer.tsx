import type { ReactElement, ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps): ReactElement {
  return (
    <div
      className={`mx-auto px-6 sm:px-8 md:max-w-2xl md:px-12 lg:max-w-4xl xl:max-w-5xl ${className}`}
    >
      {children}
    </div>
  );
}
