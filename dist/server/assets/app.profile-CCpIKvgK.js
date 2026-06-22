import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Crown, Sparkles, Mail, Calendar, Upload, Loader2, Download, LogOut } from "lucide-react";
import { u as useAuth, s as supabase } from "./router-BjAoc50q.js";
import { B as Button } from "./button-DWfIo_Ug.js";
import { P as PipLogLogo } from "./PipLogLogo-B4i-BaAs.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const CSV_COLUMNS = ["id", "opened_at", "closed_at", "pair", "side", "lot_size", "entry_price", "exit_price", "stop_loss", "take_profit", "risk_percent", "rr_ratio", "pips", "pnl", "result", "strategy", "session", "confidence", "emotion_before", "emotion_after", "mistakes", "notes"];
function escapeCsv(v) {
  if (v === null || v === void 0) return "";
  let s;
  if (Array.isArray(v)) s = v.join("; ");
  else if (v instanceof Date) s = v.toISOString();
  else s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function ProfilePage() {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name, subscription_plan, preferred_currency").eq("id", user.id).maybeSingle().then(({
      data
    }) => setProfile(data));
  }, [user]);
  const [exporting, setExporting] = useState(false);
  const handleSignOut = async () => {
    await signOut();
    navigate({
      to: "/login"
    });
  };
  const handleExport = async () => {
    if (!user || exporting) return;
    setExporting(true);
    try {
      const {
        data,
        error
      } = await supabase.from("trades").select(CSV_COLUMNS.join(",")).order("opened_at", {
        ascending: false
      });
      if (error) throw error;
      if (!data || data.length === 0) {
        toast.info("No trades to export yet");
        return;
      }
      const header = CSV_COLUMNS.join(",");
      const rows = data.map((row) => CSV_COLUMNS.map((c) => escapeCsv(row[c])).join(","));
      const csv = [header, ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      a.href = url;
      a.download = `piplog-trades-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.length} trades`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed";
      toast.error(msg);
    } finally {
      setExporting(false);
    }
  };
  const initials = (profile?.display_name || user?.email || "U").split(/\s+|@/)[0].slice(0, 2).toUpperCase();
  const created = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—";
  return /* @__PURE__ */ jsxs("div", { className: "px-5 pt-8", children: [
    /* @__PURE__ */ jsxs("header", { className: "flex flex-col items-center text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-extrabold text-primary-foreground shadow-[var(--shadow-glow-primary)]", style: {
        background: "var(--gradient-primary)"
      }, children: initials }),
      /* @__PURE__ */ jsx("h1", { className: "mt-4 text-xl font-extrabold tracking-tight", style: {
        letterSpacing: "-0.025em"
      }, children: profile?.display_name || "Trader" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: user?.email })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-6 rounded-3xl p-5 text-primary-foreground shadow-[var(--shadow-glow-primary)]", style: {
      background: "var(--gradient-primary)"
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-wider opacity-90", children: profile?.subscription_plan === "pro" ? "Pro Plan" : "Free Plan" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-lg font-bold", children: profile?.subscription_plan === "pro" ? "Unlimited trades · Full analytics" : "Upgrade for unlimited trades" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs opacity-80", children: profile?.subscription_plan === "pro" ? "Thank you for supporting PipLog." : "Get advanced analytics, exports, and cloud backup." }),
      profile?.subscription_plan !== "pro" && /* @__PURE__ */ jsxs("button", { disabled: true, className: "mt-4 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-2 text-xs font-semibold backdrop-blur", children: [
        /* @__PURE__ */ jsx(Sparkles, { className: "h-3.5 w-3.5" }),
        " Upgrade (coming soon)"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 surface-card rounded-2xl p-4", children: [
      /* @__PURE__ */ jsx(Row, { icon: Mail, label: "Email", value: user?.email ?? "—" }),
      /* @__PURE__ */ jsx(Row, { icon: Calendar, label: "Joined", value: created })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 surface-card rounded-2xl p-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Data" }),
      /* @__PURE__ */ jsx(Link, { to: "/app/import", className: "mt-3 flex w-full items-center justify-between rounded-xl bg-input p-3 text-left transition hover:bg-accent", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary", children: /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Import from broker" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: "Upload an MT4, MT5, cTrader or generic CSV" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: handleExport, disabled: exporting, className: "mt-2 flex w-full items-center justify-between rounded-xl bg-input p-3 text-left transition hover:bg-accent disabled:opacity-60", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary", children: exporting ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: "Export trades to CSV" }),
          /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground", children: exporting ? "Preparing your file…" : "Download every trade as a spreadsheet" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-4 surface-card rounded-2xl p-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Coming next" }),
      /* @__PURE__ */ jsxs("ul", { className: "mt-2 space-y-2 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx("li", { children: "· Currency selection" }),
        /* @__PURE__ */ jsx("li", { children: "· Risk preferences" }),
        /* @__PURE__ */ jsx("li", { children: "· Notifications" }),
        /* @__PURE__ */ jsx("li", { children: "· PDF export" }),
        /* @__PURE__ */ jsx("li", { children: "· Cloud backup" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: handleSignOut, className: "mt-6 h-12 w-full rounded-xl border-border bg-surface text-loss hover:text-loss", children: [
      /* @__PURE__ */ jsx(LogOut, { className: "mr-2 h-4 w-4" }),
      " Sign out"
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-8 flex justify-center opacity-60", children: /* @__PURE__ */ jsx(PipLogLogo, { size: 32 }) })
  ] });
}
function Row({
  icon: Icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 py-2", children: [
    /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-accent", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4 text-muted-foreground" }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground", children: label }),
      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: value })
    ] })
  ] });
}
export {
  ProfilePage as component
};
