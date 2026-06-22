import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Moon, Sun, User, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app/settings")({
  head: () => ({ meta: [{ title: "Settings — PipLog" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-5 pb-6">
      <header className="flex items-center gap-3">
        <Link
          to="/app"
          className="grid h-10 w-10 place-items-center rounded-2xl glass active:scale-95"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.025em" }}>
          Settings
        </h1>
      </header>

      {/* Appearance */}
      <section className="mt-6">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Appearance
        </p>
        <div className="rounded-3xl glass p-2">
          <div className="grid grid-cols-2 gap-2">
            <ThemeOption
              active={theme === "dark"}
              onClick={() => setTheme("dark")}
              icon={<Moon className="h-4 w-4" />}
              label="Dark"
              hint="Deep navy"
            />
            <ThemeOption
              active={theme === "light"}
              onClick={() => setTheme("light")}
              icon={<Sun className="h-4 w-4" />}
              label="Light"
              hint="Bright clean"
            />
          </div>
        </div>
      </section>

      {/* Account */}
      <section className="mt-6">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Account
        </p>
        <div className="overflow-hidden rounded-3xl glass">
          <SettingsRow to="/app/profile" icon={<User className="h-4 w-4" />} label="Profile" />
          <SettingsRow to="/app/profile" icon={<Bell className="h-4 w-4" />} label="Notifications" />
          <SettingsRow to="/app/profile" icon={<Shield className="h-4 w-4" />} label="Security" />
        </div>
      </section>

      {/* Support */}
      <section className="mt-6">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Support
        </p>
        <div className="overflow-hidden rounded-3xl glass">
          <SettingsRow to="/app/profile" icon={<HelpCircle className="h-4 w-4" />} label="Help & feedback" />
        </div>
      </section>

      <button
        type="button"
        onClick={async () => {
          await supabase.auth.signOut();
          navigate({ to: "/login" });
        }}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-input/40 px-4 py-3.5 text-sm font-bold text-loss active:scale-[0.98]"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </div>
  );
}

function ThemeOption({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-1 rounded-2xl p-4 text-left transition active:scale-[0.98] ${
        active
          ? "bg-primary/15 ring-1 ring-primary text-foreground"
          : "bg-input/40 text-muted-foreground hover:text-foreground"
      }`}
    >
      <span
        className={`grid h-8 w-8 place-items-center rounded-xl ${
          active ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
        }`}
      >
        {icon}
      </span>
      <span className="mt-1 text-sm font-bold">{label}</span>
      <span className="text-[11px] text-muted-foreground">{hint}</span>
    </button>
  );
}

function SettingsRow({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5 last:border-b-0 transition active:bg-accent/40"
    >
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-input/60 text-primary">
        {icon}
      </span>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
