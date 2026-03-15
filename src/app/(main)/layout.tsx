import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FloatingMenu from "@/components/layout/FloatingMenu";
import type { ReactElement, ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export default async function MainLayout({
  children,
}: MainLayoutProps): Promise<ReactElement> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-14 lg:pt-0">{children}</main>
      <FloatingMenu />
    </div>
  );
}
