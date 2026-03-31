"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { COPY } from "@/constants/copy";
import { CHECKLIST_ITEMS, CHECKLIST_CATEGORY, type ChecklistCategory } from "@/types/diary";
import { fadeSlideUp, staggerContainer } from "@/lib/motion";

export interface ChecklistState {
  category: ChecklistCategory;
  item: string;
  checked: boolean;
}

type BlurLevel = "none" | "low" | "medium" | "high";

interface Props {
  initialData?: Partial<{
    title: string;
    memo: string;
    isPublic: boolean;
    isPhotoPublic: boolean;
    blurLevel: BlurLevel;
    checklists: ChecklistState[];
  }>;
  onSubmit: (data: {
    title: string;
    memo: string;
    isPublic: boolean;
    isPhotoPublic: boolean;
    blurLevel: BlurLevel;
    checklists: { category: string; item: string; checked: boolean }[];
  }) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
  onBlurChange?: (level: BlurLevel, isPhotoPublic: boolean) => void;
}

function buildInitialChecklists(initialData?: Props["initialData"]): ChecklistState[] {
  const overrides = initialData?.checklists ?? [];
  const result: ChecklistState[] = [];

  for (const category of Object.values(CHECKLIST_CATEGORY)) {
    const items = CHECKLIST_ITEMS[category];
    for (const { key } of items) {
      const override = overrides.find((c) => c.category === category && c.item === key);
      result.push({
        category,
        item: key,
        checked: override?.checked ?? false,
      });
    }
  }

  return result;
}

const CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  [CHECKLIST_CATEGORY.MEDICATION]: COPY.DIARY_CHECKLIST_MEDICATION,
  [CHECKLIST_CATEGORY.TREATMENT]: COPY.DIARY_CHECKLIST_TREATMENT,
  [CHECKLIST_CATEGORY.LIFESTYLE]: COPY.DIARY_CHECKLIST_LIFESTYLE,
};

const BLUR_OPTIONS: { value: BlurLevel; label: string }[] = [
  { value: "none", label: "원본" },
  { value: "low", label: "약하게" },
  { value: "medium", label: "보통" },
  { value: "high", label: "강하게" },
];

export default function DiaryEntryForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
  onBlurChange,
}: Props): React.ReactElement {
  const [title, setTitle] = useState<string>(initialData?.title ?? "");
  const [memo, setMemo] = useState<string>(initialData?.memo ?? "");
  const [isPublic, setIsPublic] = useState<boolean>(initialData?.isPublic ?? false);
  const [isPhotoPublic, setIsPhotoPublic] = useState<boolean>(initialData?.isPhotoPublic ?? false);
  const [blurLevel, setBlurLevel] = useState<BlurLevel>(initialData?.blurLevel ?? "none");
  const [checklists, setChecklists] = useState<ChecklistState[]>(() =>
    buildInitialChecklists(initialData),
  );

  const isTitleValid = title.trim().length > 0;

  function toggleChecklist(category: ChecklistCategory, item: string): void {
    setChecklists((prev) =>
      prev.map((c) =>
        c.category === category && c.item === item ? { ...c, checked: !c.checked } : c,
      ),
    );
  }

  function handlePublicToggle(value: boolean): void {
    setIsPublic(value);
    if (!value) {
      setIsPhotoPublic(false);
      onBlurChange?.(blurLevel, false);
    }
  }

  function handlePhotoPublicToggle(value: boolean): void {
    setIsPhotoPublic(value);
    // photo public ON → show blur options; OFF → no photo shown, no blur
    onBlurChange?.(value ? blurLevel : "none", value);
  }

  function handleBlurLevelChange(level: BlurLevel): void {
    setBlurLevel(level);
    onBlurChange?.(level, isPhotoPublic);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!isTitleValid) return;
    await onSubmit({
      title,
      memo,
      isPublic,
      isPhotoPublic,
      blurLevel,
      checklists: checklists.filter((c) => c.checked),
    });
  }

  return (
    <motion.form
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
    >
      {/* Public toggle — moved to top */}
      <motion.div variants={fadeSlideUp} className="flex flex-col gap-3">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-sm font-medium">{COPY.DIARY_PUBLIC_LABEL}</span>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => handlePublicToggle(!isPublic)}
            className={[
              "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40",
              isPublic ? "bg-primary" : "bg-muted",
            ].join(" ")}
          >
            <span
              className={[
                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform",
                isPublic ? "translate-x-5" : "translate-x-0",
              ].join(" ")}
            />
          </button>
        </label>

        {/* Photo public toggle — only visible when public is on */}
        {isPublic && (
          <div className="flex flex-col gap-3 pl-1">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="text-sm text-muted-foreground">사진 공개</span>
              <button
                type="button"
                role="switch"
                aria-checked={isPhotoPublic}
                onClick={() => handlePhotoPublicToggle(!isPhotoPublic)}
                className={[
                  "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40",
                  isPhotoPublic ? "bg-primary" : "bg-muted",
                ].join(" ")}
              >
                <span
                  className={[
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform",
                    isPhotoPublic ? "translate-x-5" : "translate-x-0",
                  ].join(" ")}
                />
              </button>
            </label>

            {/* Blur level selector — visible when photo IS public */}
            {isPhotoPublic && (
              <div className="flex items-center gap-1.5 pl-1">
                <span className="text-xs text-muted-foreground/70 shrink-0 mr-1">블러</span>
                {BLUR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleBlurLevelChange(opt.value)}
                    className={[
                      "rounded-full px-3 py-1 text-xs font-medium transition-all",
                      blurLevel === opt.value
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:bg-muted/70",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Title input */}
      <motion.div variants={fadeSlideUp} className="flex flex-col gap-2">
        <label
          htmlFor="diary-title"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          제목 <span className="text-red-400">*</span>
        </label>
        <input
          id="diary-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="오늘의 두피 관리를 한 줄로 표현해보세요"
          maxLength={50}
          required
          className={[
            "rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40",
            !isTitleValid && title.length > 0 ? "border-red-300" : "border-border",
          ].join(" ")}
        />
      </motion.div>

      {/* Checklist groups */}
      {Object.values(CHECKLIST_CATEGORY).map((category) => {
        const items = CHECKLIST_ITEMS[category];
        return (
          <motion.div key={category} variants={fadeSlideUp} className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABELS[category]}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.map(({ key, label }) => {
                const state = checklists.find(
                  (c) => c.category === category && c.item === key,
                );
                const checked = state?.checked ?? false;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleChecklist(category, key)}
                    className={[
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      checked
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70",
                    ].join(" ")}
                  >
                    {checked && <Check size={13} strokeWidth={2.5} aria-hidden="true" />}
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        );
      })}

      {/* Memo textarea */}
      <motion.div variants={fadeSlideUp} className="flex flex-col gap-2">
        <label
          htmlFor="diary-memo"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {COPY.DIARY_MEMO_LABEL}
        </label>
        <textarea
          id="diary-memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={4}
          placeholder={COPY.DIARY_MEMO_PLACEHOLDER}
          className="rounded-xl border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </motion.div>

      {/* Submit button */}
      <motion.div variants={fadeSlideUp}>
        <button
          type="submit"
          disabled={isSubmitting || !isTitleValid}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isSubmitting ? COPY.DIARY_SUBMITTING : submitLabel}
        </button>
      </motion.div>
    </motion.form>
  );
}
