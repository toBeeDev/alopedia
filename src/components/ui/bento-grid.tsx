import { type ReactNode, type ReactElement } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function BentoGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-2 gap-3 lg:auto-rows-[22rem] lg:grid-cols-3 lg:gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

function BentoCard({
  name,
  className,
  icon,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  icon: ReactNode;
  description: string;
  href: string;
  cta: string;
}): ReactElement {
  return (
    <Link
      href={href}
      className={cn(
        "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl bg-card lg:col-span-3",
        "[box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        className,
      )}
    >
      <div className="z-10 flex flex-col gap-1 p-5 lg:p-6">
        {icon}
        <h3 className="mt-2 text-base font-bold text-foreground lg:text-lg">{name}</h3>
        <p className="max-w-lg text-xs text-muted-foreground lg:text-sm">{description}</p>
      </div>

      <div className="flex w-full items-center p-4 pt-0">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground opacity-60 transition-opacity duration-200 group-hover:opacity-100">
          {cta}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </span>
      </div>

      <div className="pointer-events-none absolute inset-0 transition-colors duration-200 group-hover:bg-black/[.02]" />
    </Link>
  );
}

export { BentoCard, BentoGrid };
