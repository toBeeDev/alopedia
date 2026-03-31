"use client";

import { useState, type ReactElement, type FormEvent, type ChangeEvent } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { useAuth } from "@/hooks/useAuth";
import { COPY } from "@/constants/copy";

export default function ContactPage(): ReactElement {
  const { user } = useAuth();

  const [email, setEmail] = useState<string>(user?.email ?? "");
  const [subject, setSubject] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Sync email when auth loads
  if (user?.email && email === "") {
    setEmail(user.email);
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, content }),
      });

      if (res.ok) {
        setSuccessMessage(COPY.CONTACT_SUCCESS);
        setSubject("");
        setContent("");
      } else {
        const data = (await res.json()) as { error?: string };
        setErrorMessage(data.error ?? COPY.ERROR_NETWORK);
      }
    } catch {
      setErrorMessage(COPY.ERROR_NETWORK);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer className="py-12">
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold mb-6">{COPY.CONTACT_TITLE}</h1>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-email" className="text-sm font-medium">
              {COPY.CONTACT_EMAIL_LABEL}
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => setEmail(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="example@email.com"
            />
          </div>

          {/* Subject */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-subject" className="text-sm font-medium">
              제목
            </label>
            <input
              id="contact-subject"
              type="text"
              required
              maxLength={200}
              value={subject}
              onChange={(e: ChangeEvent<HTMLInputElement>): void => setSubject(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder={COPY.CONTACT_SUBJECT_PLACEHOLDER}
            />
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contact-content" className="text-sm font-medium">
              내용
            </label>
            <textarea
              id="contact-content"
              required
              rows={6}
              maxLength={5000}
              value={content}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>): void => setContent(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
              placeholder={COPY.CONTACT_BODY_PLACEHOLDER}
            />
            <span className="text-xs text-muted-foreground text-right">
              {content.length} / 5000
            </span>
          </div>

          {/* Feedback */}
          {successMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
          )}
          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "전송 중..." : COPY.CONTACT_SUBMIT}
          </button>
        </form>
      </div>
    </PageContainer>
  );
}
