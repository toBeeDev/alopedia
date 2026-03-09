import FloatingMenu from "@/components/layout/FloatingMenu";
import Footer from "@/components/layout/Footer";
import type { ReactElement, ReactNode } from "react";

interface BoardLayoutProps {
  children: ReactNode;
}

export default function BoardLayout({
  children,
}: BoardLayoutProps): ReactElement {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <main>{children}</main>
      <Footer />
      <FloatingMenu />
    </div>
  );
}
