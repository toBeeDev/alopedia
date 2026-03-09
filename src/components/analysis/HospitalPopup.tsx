"use client";

import { type ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COPY } from "@/constants/copy";

interface HospitalPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HospitalPopup({
  isOpen,
  onClose,
}: HospitalPopupProps): ReactElement {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 모달 */}
          <motion.div
            className="fixed inset-x-4 bottom-8 z-50 mx-auto max-w-md rounded-3xl bg-white p-8 shadow-2xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
              <MapPin className="h-7 w-7 text-red-500" />
            </div>

            <h2 className="mb-2 text-xl font-bold text-[#323338]">
              {COPY.HOSPITAL_POPUP_TITLE}
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-[#676879]">
              {COPY.HOSPITAL_POPUP_BODY}
            </p>

            <Button
              onClick={onClose}
              className="w-full bg-[#6161FF] py-6 text-base font-semibold hover:bg-[#4338ca]"
            >
              {COPY.HOSPITAL_POPUP_CTA}
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
