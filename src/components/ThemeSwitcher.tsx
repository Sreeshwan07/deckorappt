import { useTheme, THEMES, ThemeId } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, def } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group inline-flex items-center gap-2 rounded-full border border-border/60 bg-secondary/40 hover:bg-secondary/70 transition-all px-2.5 py-1.5",
          compact ? "" : "pr-3"
        )}
        aria-label="Switch theme"
      >
        <span className="relative flex items-center">
          <span
            className="h-3.5 w-3.5 rounded-full ring-1 ring-white/10"
            style={{ background: `linear-gradient(135deg, ${def.swatch[0]}, ${def.swatch[1]})` }}
          />
        </span>
        {!compact && <span className="text-xs font-medium text-foreground/80 hidden sm:inline">{def.name}</span>}
        <Palette className="h-3.5 w-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-card-strong">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(THEMES) as ThemeId[]).map((id) => {
          const t = THEMES[id];
          const active = id === theme;
          return (
            <DropdownMenuItem
              key={id}
              onClick={() => setTheme(id)}
              className="flex items-center gap-3 cursor-pointer py-2"
            >
              <span
                className="h-5 w-5 rounded-full ring-1 ring-white/10 shrink-0"
                style={{ background: `linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]})` }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{t.name}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{t.tagline}</div>
              </div>
              {active && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
