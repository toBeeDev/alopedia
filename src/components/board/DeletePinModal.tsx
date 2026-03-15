"use client";

import { useState, type ReactElement } from "react";
import { motion } from "framer-motion";

interface DeletePinModalProps {
  onClose: () => void;
  onConfirm: (pin: string) => void;
}

export default function DeletePinModal({
  onClose,
  onConfirm,
}: DeletePinModalProps): ReactElement {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleConfirm(): void {
    if (!/^\d{4}$/.test(pin)) {
      setError("숫자 4자리를 입력해주세요.");
      return;
    }
    onConfirm(pin);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="w-80 rounded-2xl bg-card p-6 shadow-xl"
      >
        <h3 className="mb-1 text-base font-bold text-foreground">
          게시글 삭제
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          작성 시 설정한 비밀번호 4자리를 입력해주세요.
        </p>

        <input
          type="password"
          inputMode="numeric"
          placeholder="••••"
          value={pin}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            setPin(v);
            setError("");
          }}
          maxLength={4}
          className="mb-3 w-full rounded-xl border border-border px-4 py-3 text-center text-lg tracking-[0.5em] text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-foreground"
          autoFocus
        />

        {error && (
          <p className="mb-3 text-center text-xs text-red-500">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-full py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 active:scale-95"
          >
            삭제
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
