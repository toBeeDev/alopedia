import { GRADE_CONFIG } from "@/constants/gradeConfig";
import { COPY } from "@/constants/copy";
import { EagleIcon } from "@/components/ui/eagle-icons";
import SeoCta from "@/components/seo/SeoCta";
import type { GradeLevel } from "@/constants/gradeConfig";

interface SeoLandingLayoutProps {
  readonly heroTitle: string;
  readonly heroDescription: string;
  readonly sections: readonly { readonly title: string; readonly body: string }[];
  readonly faq: readonly { readonly question: string; readonly answer: string }[];
  readonly ctaText: string;
}

const GRADE_KEYS = [1, 2, 3, 4, 5] as const;

export default function SeoLandingLayout({
  heroTitle,
  heroDescription,
  sections,
  faq,
  ctaText,
}: SeoLandingLayoutProps): React.ReactElement {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="pb-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
          <EagleIcon grade={3} size={56} />
        </div>
        <h1 className="whitespace-pre-line text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {heroTitle}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          {heroDescription}
        </p>
        <div className="mt-8">
          <SeoCta text={ctaText} />
        </div>
      </section>

      {/* Content Sections */}
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold sm:text-2xl">
              {section.title}
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      {/* Grade Visualization — 독수리 캐릭터 */}
      <section className="mt-16">
        <h2 className="mb-2 text-xl font-semibold sm:text-2xl">
          5마리의 독수리가 알려주는 두피 등급
        </h2>
        <p className="mb-8 text-sm text-muted-foreground">
          {COPY.GUIDE_SECTION_GRADE_DESC}
        </p>
        <div className="grid gap-3 sm:grid-cols-5">
          {GRADE_KEYS.map((grade) => {
            const config = GRADE_CONFIG[grade];
            return (
              <div
                key={grade}
                className="flex flex-col items-center rounded-2xl border p-4 text-center transition-shadow hover:shadow-md"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${config.color}12` }}
                >
                  <EagleIcon grade={grade as GradeLevel} size={40} />
                </div>
                <span
                  className="mt-2 text-sm font-bold"
                  style={{ color: config.color }}
                >
                  {config.eagleLabel}
                </span>
                <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
                  {grade}단계 · {config.label}
                </span>
                <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground/70">
                  {config.eagleDesc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-16">
        <h2 className="mb-6 text-xl font-semibold sm:text-2xl">
          자주 묻는 질문
        </h2>
        <div className="divide-y rounded-xl border">
          {faq.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-left font-medium transition-colors hover:bg-muted/50">
                <span>{item.question}</span>
                <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180">
                  &#9662;
                </span>
              </summary>
              <div className="px-5 pb-4 leading-relaxed text-muted-foreground">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <SeoCta text={ctaText} />

      {/* Medical Disclaimer */}
      <footer className="mt-8 border-t pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          {COPY.DISCLAIMER_FULL}
        </p>
      </footer>
    </main>
  );
}
