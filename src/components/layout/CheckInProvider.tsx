"use client";

import type { ReactElement, ReactNode } from "react";
import { useCheckIn } from "@/hooks/useCheckIn";

interface CheckInProviderProps {
  children: ReactNode;
}

export default function CheckInProvider({
  children,
}: CheckInProviderProps): ReactElement {
  useCheckIn();
  return <>{children}</>;
}
