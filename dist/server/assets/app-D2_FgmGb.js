import { jsx, jsxs } from "react/jsx-runtime";
import { useLocation, Link, useNavigate, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { u as useAuth } from "./router-BjAoc50q.js";
import { Home, CalendarDays, Plus, BarChart3, User } from "lucide-react";
import { P as PipLogLogo } from "./PipLogLogo-B4i-BaAs.js";
import "@supabase/supabase-js";
import "sonner";
const items = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/app/add", label: "Add", icon: Plus, primary: true },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/profile", label: "Profile", icon: User }
];
function BottomNav() {
  const location = useLocation();
  return /* @__PURE__ */ jsx("nav", { className: "fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-md safe-bottom", children: /* @__PURE__ */ jsx("div", { className: "mx-3 mb-3 rounded-2xl glass shadow-[var(--shadow-elevated)]", children: /* @__PURE__ */ jsx("ul", { className: "flex items-center justify-around px-2 py-2", children: items.map((item) => {
    const Icon = item.icon;
    const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
    if (item.primary) {
      return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
        Link,
        {
          to: item.to,
          className: "flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full text-primary-foreground shadow-[var(--shadow-glow-primary)] transition-transform hover:scale-105 active:scale-95",
          style: { background: "var(--gradient-primary)" },
          "aria-label": "Add trade",
          children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5", strokeWidth: 2.5 })
        }
      ) }, item.to);
    }
    return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
      Link,
      {
        to: item.to,
        className: `flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`,
        children: [
          /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5", strokeWidth: isActive ? 2.5 : 2 }),
          /* @__PURE__ */ jsx("span", { children: item.label })
        ]
      }
    ) }, item.to);
  }) }) }) });
}
function AppLayout() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) {
      navigate({
        to: "/login"
      });
    }
  }, [loading, user, navigate]);
  if (loading || !user) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsx(PipLogLogo, { size: 64 }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto min-h-screen max-w-md pb-28", children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(BottomNav, {})
  ] });
}
export {
  AppLayout as component
};
