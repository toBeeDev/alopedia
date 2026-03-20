"use client";

import { type ReactElement } from "react";
import { COPY } from "@/constants/copy";
import { EagleIcon } from "@/components/ui/eagle-icons";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ScanError({ reset }: ErrorBoundaryProps): ReactElement {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <EagleIcon grade={3} size={48} />
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          {COPY.ERROR_ANALYSIS_FAILED}
        </h2>
        <p className="text-sm text-gray-500">{COPY.ERROR_NETWORK}</p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
      >
        다시 시도하기
      </button>
    </div>
  );
}
