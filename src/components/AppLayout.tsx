import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Sparkles,
  LogOut,
  Presentation,
  Menu,
  X,
  Library,
  Download,
  Settings,
  Bell,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeSwitcher from "@/components/ThemeSwitcher";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "AI Studio", icon: Sparkles, path: "/create" },
  { label: "Library", icon: Library, path: "/dashboard?tab=templates" },
  { label: "Exports", icon: Download, path: "/dashboard?tab=exports" },
  { label: "Settings", icon: Settings, path: "/dashboard?tab=settings" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    const base = path.split("?")[0];
    return location.pathname === base;
  };

  return (
    <div className="min-h-screen flex cinematic-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-60 flex flex-col transition-transform duration-300 lg:translate-x-0",
          "bg-sidebar/80 backdrop-blur-2xl border-r border-sidebar-border",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
          <span className="text-xl font-semibold font-display tracking-tight text-foreground">Deckora</span>
          <span className="text-[9px] font-mono-cy uppercase text-muted-foreground ml-auto px-1.5 py-0.5 rounded border border-border/60">
            v2
          </span>
          <button className="lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <div className="px-3 pb-2 text-[10px] font-mono-cy uppercase tracking-widest text-muted-foreground/60">
            Workspace
          </div>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={cn(
                  "relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-primary glow-primary-sm" />
                )}
                <item.icon className={cn("h-4 w-4", active && "text-primary")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-3 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-sidebar-accent/40">
            <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-foreground truncate">{user?.email?.split("@")[0]}</div>
              <div className="text-[10px] text-muted-foreground truncate">Pro plan</div>
            </div>
            <button onClick={signOut} className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Sign out">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="sticky top-0 z-30 bg-background/60 backdrop-blur-2xl border-b border-border/60 h-14 flex items-center px-4 lg:px-6 gap-3">
          <button className="lg:hidden mr-1" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="hidden md:flex items-center gap-2 max-w-xs flex-1 px-3 py-1.5 rounded-lg bg-secondary/40 border border-border/50">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search decks, templates..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
            <kbd className="text-[9px] font-mono-cy text-muted-foreground/60 px-1.5 py-0.5 rounded bg-background/60 border border-border/40">⌘K</kbd>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeSwitcher />
            <button className="relative p-2 rounded-lg hover:bg-secondary/60 transition-colors">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 relative">{children}</main>
      </div>
    </div>
  );
}
