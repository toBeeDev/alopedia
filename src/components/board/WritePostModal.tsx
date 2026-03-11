"use client";

import { useState, type ReactElement } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { COPY } from "@/constants/copy";

export interface WritePostData {
  board: string;
  title: string;
  content: string;
  deletePin: string;
}

interface WritePostModalProps {
  onClose: () => void;
  onSubmit: (data: WritePostData) => void;
  initial?: { board: string; title: string; content: string };
}

export default function WritePostModal({
  onClose,
  onSubmit,
  initial,
}: WritePostModalProps): ReactElement {
  const isEdit = !!initial;
  const [board, setBoard] = useState(initial?.board ?? "lounge");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [deletePin, setDeletePin] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(): void {
    if (title.trim().length < 2) {
      setError("제목은 2자 이상 입력해주세요.");
      return;
    }
    if (content.trim().length < 10) {
      setError("내용은 10자 이상 입력해주세요.");
      return;
    }
    if (!isEdit && !/^\d{4}$/.test(deletePin)) {
      setError("삭제 비밀번호는 숫자 4자리로 입력해주세요.");
      return;
    }
    onSubmit({ board, title, content, deletePin });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#323338]">
            {isEdit ? "글 수정" : "글쓰기"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F5F5F7]"
          >
            <X className="h-5 w-5 text-[#9DA0AE]" />
          </button>
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto">
          {Object.entries(COPY.BOARD_NAME).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setBoard(key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                board === key
                  ? "bg-[#6161FF] text-white"
                  : "bg-[#F5F5F7] text-[#676879]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="제목을 입력해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          className="mb-3 w-full rounded-xl border border-[#EEEFF2] px-4 py-3 text-sm text-[#323338] outline-none placeholder:text-[#B0B3BE] focus:border-[#6161FF]"
        />

        <textarea
          placeholder="내용을 입력해주세요 (10자 이상)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={5000}
          rows={6}
          className="mb-3 w-full resize-none rounded-xl border border-[#EEEFF2] px-4 py-3 text-sm leading-relaxed text-[#323338] outline-none placeholder:text-[#B0B3BE] focus:border-[#6161FF]"
        />

        {!isEdit && (
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-medium text-[#676879]">
              삭제 비밀번호 (숫자 4자리)
            </label>
            <input
              type="password"
              inputMode="numeric"
              placeholder="••••"
              value={deletePin}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                setDeletePin(v);
              }}
              maxLength={4}
              className="w-32 rounded-xl border border-[#EEEFF2] px-4 py-3 text-center text-sm tracking-[0.3em] text-[#323338] outline-none placeholder:text-[#B0B3BE] focus:border-[#6161FF]"
            />
          </div>
        )}

        {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-[#676879] hover:bg-[#F5F5F7]"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-full bg-[#6161FF] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#6161FF]/25 transition-all hover:bg-[#4338ca] active:scale-95"
          >
            {isEdit ? "수정하기" : "등록하기"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
