import Link from "next/link";
import { COPY } from "@/constants/copy";
import { EagleIcon } from "@/components/ui/eagle-icons";

interface SeoCtaProps {
  readonly text: string;
}

export default function SeoCta({ text }: SeoCtaProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <Link
        href="/try"
        className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-foreground px-8 py-4 text-lg font-semibold text-background transition-opacity hover:opacity-90"
      >
        <EagleIcon grade={1} size={24} />
        {text}
      </Link>
      <p className="text-sm text-muted-foreground">{COPY.SEO_CTA_SUB}</p>
      <p className="mt-2 max-w-md text-center text-xs text-muted-foreground">
        {COPY.DISCLAIMER_SHORT}
      </p>
    </div>
  );
}
