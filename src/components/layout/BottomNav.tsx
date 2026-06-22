import { Link, useLocation } from "@tanstack/react-router";
import { Home, CalendarDays, Plus, BarChart3, User } from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  exact?: boolean;
  primary?: boolean;
};

const items: NavItem[] = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/app/add", label: "Add", icon: Plus, primary: true },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md safe-bottom">
      <div className="mx-3 mb-3 rounded-2xl glass shadow-[var(--shadow-elevated)]">
        <ul className="flex items-center justify-around px-2 py-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);

            if (item.primary) {
              return (
                <li key={item.to}>
                  <Link
                    to={item.to as "/app/add"}
                    className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full text-primary-foreground shadow-[var(--shadow-glow-primary)] transition-transform hover:scale-105 active:scale-95"
                    style={{ background: "var(--gradient-primary)" }}
                    aria-label="Add trade"
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.to}>
                <Link
                  to={item.to as "/app"}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
