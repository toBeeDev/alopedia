"use client";

import { useState, type ReactElement } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { EagleIcon } from "@/components/ui/eagle-icons";
import { COPY } from "@/constants/copy";

export default function GuestResultCta(): ReactElement {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return <></>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.8 }}
      className="mx-auto mt-6 max-w-4xl"
    >
      <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-border">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/5">
            <EagleIcon grade={1} size={40} />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {COPY.GUEST_RESULT_TITLE}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {COPY.GUEST_RESULT_SAVE}
            </p>
          </div>
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-4 text-base font-semibold text-background shadow-lg shadow-black/15 transition-all hover:bg-foreground/85 active:scale-[0.98]"
          >
            <EagleIcon grade={1} size={20} />
            {COPY.GUEST_SIGNUP_CTA}
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {COPY.GUEST_DISMISS}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
