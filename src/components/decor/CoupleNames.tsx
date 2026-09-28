import { cn } from "@/lib/utils";

/** Renders "Nima & Sam" in script with a gold italic ampersand. */
export default function CoupleNames({
  names,
  className,
  as: Tag = "h1",
}: {
  names: string;
  className?: string;
  as?: "h1" | "h2" | "p";
}) {
  const parts = names.split(/\s*(?:&|\band\b)\s*/i).filter(Boolean);

  return (
    <Tag className={cn("font-script", className)}>
      {parts.length === 2 ? (
        <>
          {parts[0]}
          <span className="ampersand mx-2 inline-block font-display text-[0.6em] align-middle">
            &amp;
          </span>
          {parts[1]}
        </>
      ) : (
        names
      )}
    </Tag>
  );
}
