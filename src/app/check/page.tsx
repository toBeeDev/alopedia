import type { Metadata } from "next";
import { GRADE_CONFIG } from "@/constants/gradeConfig";
import type { GradeLevel } from "@/constants/gradeConfig";
import { COPY } from "@/constants/copy";
import { EagleIcon } from "@/components/ui/eagle-icons";
import SeoCta from "@/components/seo/SeoCta";
import { Testimonial } from "@/components/ui/design-testimonial";
import { SEO_COPY } from "@/constants/seoCopy";

interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alopedia.kr";
const PAGE = SEO_COPY.unified;

export const metadata: Metadata = {
  title: PAGE.metaTitle,
  description: PAGE.metaDescription,
  keywords: [...PAGE.keywords],
  openGraph: {
    title: PAGE.metaTitle,
    description: PAGE.metaDescription,
    url: `${SITE_URL}/check`,
    siteName: "Alopedia",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: PAGE.metaTitle,
      },
    ],
  },
  alternates: {
    canonical: `${SITE_URL}/check`,
  },
};

const GRADE_KEYS = [1, 2, 3, 4, 5] as const;

function buildFaqSchema(): Record<string, unknown> {
  const allFaq = PAGE.topics.flatMap((t) => [...t.faq] as FaqItem[]);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export default function CheckPage(): React.ReactElement {
  const allFaq = PAGE.topics.flatMap((t) => [...t.faq] as FaqItem[]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema()) }}
      />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero */}
        <section className="pb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <EagleIcon grade={3} size={56} />
          </div>
          <h1 className="whitespace-pre-line text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {PAGE.heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {PAGE.heroDescription}
          </p>
          <div className="mt-8">
            <SeoCta text={PAGE.ctaText} />
          </div>
        </section>

        {/* Topic Navigation */}
        <nav className="mb-12 flex justify-center gap-2">
          {PAGE.topics.map((topic) => (
            <a
              key={topic.id}
              href={`#${topic.id}`}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {topic.navLabel}
            </a>
          ))}
        </nav>

        {/* Topics */}
        <div className="space-y-20">
          {PAGE.topics.map((topic) => (
            <section key={topic.id} id={topic.id} className="scroll-mt-20">
              {/* Topic Header */}
              <div className="mb-8 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${topic.accentColor}15` }}
                >
                  <EagleIcon grade={topic.grade as GradeLevel} size={28} />
                </div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  {topic.title}
                </h2>
              </div>
              <p className="mb-8 text-muted-foreground">{topic.description}</p>

              {/* Sections */}
              <div className="space-y-8">
                {topic.sections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-lg font-semibold sm:text-xl">
                      {section.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* User Testimonials */}
        <section className="mt-20">
          <h2 className="mb-2 text-xl font-semibold sm:text-2xl">
            독수리와 함께한 분들의 이야기
          </h2>
          <p className="mb-8 text-sm text-muted-foreground">
            실제로 Alopedia를 사용하고 변화를 경험한 분들의 후기예요.
          </p>
          <div className="rounded-2xl p-4 sm:p-6">
            <Testimonial />
          </div>
        </section>

        {/* Grade Visualization */}
        <section className="mt-20">
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

        {/* Combined FAQ */}
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-semibold sm:text-2xl">
            자주 묻는 질문
          </h2>
          <div className="divide-y rounded-xl border">
            {allFaq.map((item) => (
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
        <SeoCta text={PAGE.ctaText} />

        {/* Medical Disclaimer */}
        <footer className="mt-8 border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            {COPY.DISCLAIMER_FULL}
          </p>
        </footer>
      </main>
    </>
  );
}
