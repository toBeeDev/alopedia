import type { Metadata } from "next";
import SeoLandingLayout from "@/components/seo/SeoLandingLayout";
import { SEO_COPY } from "@/constants/seoCopy";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://alopedia.kr";
const PAGE = SEO_COPY.crownCheck;

export const metadata: Metadata = {
  title: PAGE.metaTitle,
  description: PAGE.metaDescription,
  keywords: [...PAGE.keywords],
  openGraph: {
    title: PAGE.metaTitle,
    description: PAGE.metaDescription,
    url: `${SITE_URL}/crown-check`,
    siteName: "Alopedia",
    type: "website",
    locale: "ko_KR",
  },
  alternates: {
    canonical: `${SITE_URL}/crown-check`,
  },
};

function buildFaqSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: PAGE.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export default function CrownCheckPage(): React.ReactElement {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqSchema()) }}
      />
      <SeoLandingLayout
        heroTitle={PAGE.heroTitle}
        heroDescription={PAGE.heroDescription}
        sections={PAGE.sections}
        faq={PAGE.faq}
        ctaText={PAGE.ctaText}
      />
    </>
  );
}
