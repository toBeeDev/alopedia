"use client";

import type { ReactElement, ReactNode } from "react";
import { useCheckIn } from "@/hooks/useCheckIn";
import { useInitKakaoSdk } from "@/hooks/useInitKakaoSdk";

interface CheckInProviderProps {
  children: ReactNode;
}

export default function CheckInProvider({
  children,
}: CheckInProviderProps): ReactElement {
  useCheckIn();
  useInitKakaoSdk();
  return <>{children}</>;
}
