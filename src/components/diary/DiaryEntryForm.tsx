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

interface Props {
  initialData?: Partial<{
    memo: string;
    isPublic: boolean;
    isPhotoPublic: boolean;
    checklists: ChecklistState[];
  }>;
  onSubmit: (data: {
    memo: string;
    isPublic: boolean;
    isPhotoPublic: boolean;
    checklists: { category: string; item: string; checked: boolean }[];
  }) => Promise<void>;
  isSubmitting: boolean;
  submitLabel: string;
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

export default function DiaryEntryForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel,
}: Props): React.ReactElement {
  const [memo, setMemo] = useState<string>(initialData?.memo ?? "");
  const [isPublic, setIsPublic] = useState<boolean>(initialData?.isPublic ?? false);
  const [isPhotoPublic, setIsPhotoPublic] = useState<boolean>(initialData?.isPhotoPublic ?? false);
  const [checklists, setChecklists] = useState<ChecklistState[]>(() =>
    buildInitialChecklists(initialData),
  );

  function toggleChecklist(category: ChecklistCategory, item: string): void {
    setChecklists((prev) =>
      prev.map((c) =>
        c.category === category && c.item === item ? { ...c, checked: !c.checked } : c,
      ),
    );
  }

  function handlePublicToggle(value: boolean): void {
    setIsPublic(value);
    if (!value) setIsPhotoPublic(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    await onSubmit({
      memo,
      isPublic,
      isPhotoPublic,
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

      {/* Public toggle */}
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
          <label className="flex items-center justify-between cursor-pointer select-none pl-1">
            <span className="text-sm text-muted-foreground">{COPY.DIARY_PHOTO_PUBLIC_LABEL}</span>
            <button
              type="button"
              role="switch"
              aria-checked={isPhotoPublic}
              onClick={() => setIsPhotoPublic((v) => !v)}
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
        )}
      </motion.div>

      {/* Submit button */}
      <motion.div variants={fadeSlideUp}>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isSubmitting ? COPY.DIARY_SUBMITTING : submitLabel}
        </button>
      </motion.div>
    </motion.form>
  );
}
