import { cn } from "@/lib/utils";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      {eyebrow && (
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-ink">
          <span aria-hidden="true" className="h-px w-8 bg-gradient-to-r from-transparent to-accent" />
          {eyebrow}
          <span aria-hidden="true" className="h-px w-8 bg-gradient-to-l from-transparent to-accent" />
        </p>
      )}
      <Tag className="mt-2 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        {title}
      </Tag>
      {subtitle && (
        <p className="mt-2 max-w-md text-balance text-base leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}
