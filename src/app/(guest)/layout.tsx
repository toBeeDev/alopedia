import type { ReactElement, ReactNode } from "react";

interface GuestLayoutProps {
  children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps): ReactElement {
  return (
    <div className="min-h-screen bg-background">
      <main>{children}</main>
    </div>
  );
}
