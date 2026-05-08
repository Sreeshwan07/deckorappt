import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  as?: "span" | "h1" | "div";
}

/**
 * Deckora wordmark — geometric rounded typography (Sora),
 * subtle navy → teal → slate-blue gradient. No icons, no badges.
 */
export default function BrandLogo({ className, as: Tag = "span" }: BrandLogoProps) {
  return (
    <Tag
      className={cn("brand-deckora select-none", className)}
      aria-label="Deckora"
    >
      Deckora
    </Tag>
  );
}
