import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { ChevronLeft, Moon, Sun, User, Bell, Shield, HelpCircle, LogOut, ChevronRight } from "lucide-react";
import { a as useTheme, s as supabase } from "./router-BjAoc50q.js";
import "react";
import "@supabase/supabase-js";
import "sonner";
function SettingsPage() {
  const {
    theme,
    setTheme
  } = useTheme();
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs("div", { className: "px-4 pt-5 pb-6", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Link, { to: "/app", className: "grid h-10 w-10 place-items-center rounded-2xl glass active:scale-95", "aria-label": "Back", children: /* @__PURE__ */ jsx(ChevronLeft, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold tracking-tight", style: {
        letterSpacing: "-0.025em"
      }, children: "Settings" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-6", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Appearance" }),
      /* @__PURE__ */ jsx("div", { className: "rounded-3xl glass p-2", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsx(ThemeOption, { active: theme === "dark", onClick: () => setTheme("dark"), icon: /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" }), label: "Dark", hint: "Deep navy" }),
        /* @__PURE__ */ jsx(ThemeOption, { active: theme === "light", onClick: () => setTheme("light"), icon: /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" }), label: "Light", hint: "Bright clean" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-6", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Account" }),
      /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-3xl glass", children: [
        /* @__PURE__ */ jsx(SettingsRow, { to: "/app/profile", icon: /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }), label: "Profile" }),
        /* @__PURE__ */ jsx(SettingsRow, { to: "/app/profile", icon: /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4" }), label: "Notifications" }),
        /* @__PURE__ */ jsx(SettingsRow, { to: "/app/profile", icon: /* @__PURE__ */ jsx(Shield, { className: "h-4 w-4" }), label: "Security" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-6", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground", children: "Support" }),
      /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-3xl glass", children: /* @__PURE__ */ jsx(SettingsRow, { to: "/app/profile", icon: /* @__PURE__ */ jsx(HelpCircle, { className: "h-4 w-4" }), label: "Help & feedback" }) })
    ] }),
    /* @__PURE__ */ jsxs("button", { type: "button", onClick: async () => {
      await supabase.auth.signOut();
      navigate({
        to: "/login"
      });
    }, className: "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-input/40 px-4 py-3.5 text-sm font-bold text-loss active:scale-[0.98]", children: [
      /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
      "Sign out"
    ] })
  ] });
}
function ThemeOption({
  active,
  onClick,
  icon,
  label,
  hint
}) {
  return /* @__PURE__ */ jsxs("button", { type: "button", onClick, className: `flex flex-col items-start gap-1 rounded-2xl p-4 text-left transition active:scale-[0.98] ${active ? "bg-primary/15 ring-1 ring-primary text-foreground" : "bg-input/40 text-muted-foreground hover:text-foreground"}`, children: [
    /* @__PURE__ */ jsx("span", { className: `grid h-8 w-8 place-items-center rounded-xl ${active ? "bg-primary text-primary-foreground" : "bg-card text-foreground"}`, children: icon }),
    /* @__PURE__ */ jsx("span", { className: "mt-1 text-sm font-bold", children: label }),
    /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground", children: hint })
  ] });
}
function SettingsRow({
  to,
  icon,
  label
}) {
  return /* @__PURE__ */ jsxs(Link, { to, className: "flex items-center gap-3 border-b border-border/60 px-4 py-3.5 last:border-b-0 transition active:bg-accent/40", children: [
    /* @__PURE__ */ jsx("span", { className: "grid h-8 w-8 place-items-center rounded-xl bg-input/60 text-primary", children: icon }),
    /* @__PURE__ */ jsx("span", { className: "flex-1 text-sm font-semibold", children: label }),
    /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" })
  ] });
}
export {
  SettingsPage as component
};
