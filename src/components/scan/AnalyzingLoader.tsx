"use client";

import { type ReactElement } from "react";
import { motion } from "framer-motion";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { COPY } from "@/constants/copy";

interface AnalyzingLoaderProps {
  message: string;
  subMessage?: string;
}

export default function AnalyzingLoader({
  message,
  subMessage,
}: AnalyzingLoaderProps): ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="mb-5"
      >
        <EagleIcon grade={3} size={72} />
      </motion.div>
      <p className="text-lg font-semibold text-foreground">{message}</p>
      <p className="mt-2 text-sm text-muted-foreground/70">
        {subMessage ?? COPY.SCAN_UPLOAD_WARN}
      </p>
    </div>
  );
}
