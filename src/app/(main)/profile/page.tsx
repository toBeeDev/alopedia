"use client";

import type { ReactElement } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageContainer from "@/components/layout/PageContainer";
import { useAuth } from "@/hooks/useAuth";
import { COPY } from "@/constants/copy";

export default function ProfilePage(): ReactElement {
  const { user, signOut } = useAuth();

  return (
    <PageContainer className="py-10">
      <h2 className="mb-6 text-lg font-bold text-[#323338]">
        {COPY.PAGE_TITLE_PROFILE}
      </h2>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-sm text-[#676879]">
          {user?.email ?? "로그인 정보 없음"}
        </p>
      </div>

      <Button
        variant="ghost"
        onClick={signOut}
        className="mt-6 w-full text-sm text-red-500 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="mr-2 h-4 w-4" />
        {COPY.LOGOUT}
      </Button>

    </PageContainer>
  );
}
