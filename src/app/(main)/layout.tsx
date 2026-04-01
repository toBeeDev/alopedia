import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FloatingMenu from "@/components/layout/FloatingMenu";
import CheckInProvider from "@/components/layout/CheckInProvider";
import LightFooter from "@/components/layout/LightFooter";
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
    <CheckInProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-1 flex flex-col pt-[calc(3.5rem+env(safe-area-inset-top,0px))] lg:pt-0">
          {children}
        </main>
        <LightFooter />
        <FloatingMenu />
      </div>
    </CheckInProvider>
  );
}
