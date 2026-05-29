import { cn } from "@/lib/utils/cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeader({ eyebrow, title, description, align = "center" }: SectionHeaderProps) {
  return (
    <div className={cn("mx-auto max-w-2xl", align === "center" ? "text-center" : "mx-0 text-left")}>
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1e7894] sm:text-sm sm:tracking-[0.2em]">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-bold leading-snug text-[#1d261f] sm:text-3xl md:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-[15px] leading-7 text-[#5d665e] sm:text-base">{description}</p> : null}
    </div>
  );
}
