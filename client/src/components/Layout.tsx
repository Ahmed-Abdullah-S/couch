import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSwitcher, LanguageSwitcherCompact } from "@/components/LanguageSwitcher";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Dumbbell, 
  Utensils, 
  TrendingUp, 
  History, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { t, dir } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/app", icon: LayoutDashboard, label: t.nav.dashboard },
    { href: "/app/chat", icon: MessageSquare, label: t.nav.chat },
    { href: "/app/plan/training", icon: Dumbbell, label: t.nav.training },
    { href: "/app/plan/nutrition", icon: Utensils, label: t.nav.nutrition },
    { href: "/app/progress", icon: TrendingUp, label: t.nav.progress },
    { href: "/app/workouts", icon: History, label: t.nav.workouts },
    { href: "/app/settings", icon: Settings, label: t.nav.settings },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border rtl:border-r-0 rtl:border-l">
      <div className="p-6">
        <h1 className="text-3xl font-display font-bold text-primary">{t.landing.title}</h1>
        <div className="mt-4">
          <LanguageSwitcher />
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
                <span className="font-medium text-sm md:text-base">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-4 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t.common.logout}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div dir={dir} className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-display font-bold text-primary">{t.landing.title}</h1>
        <div className="flex items-center gap-3">
          <LanguageSwitcherCompact />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === 'rtl' ? 'right' : 'left'} className="p-0 border-r border-border w-72">
              <NavContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <main className="flex-1 px-4 py-8 lg:p-8 mt-16 lg:mt-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
