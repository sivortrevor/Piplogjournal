import { jsxs, jsx } from "react/jsx-runtime";
import { BookOpen } from "lucide-react";
function JournalPage() {
  return /* @__PURE__ */ jsxs("div", { className: "px-5 pt-8", children: [
    /* @__PURE__ */ jsxs("header", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-extrabold tracking-tight", style: {
        letterSpacing: "-0.025em"
      }, children: "Journal" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Daily reflections, lessons, and goals." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "surface-card mt-8 flex flex-col items-center rounded-3xl p-8 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-16 w-16 items-center justify-center rounded-2xl text-white", style: {
        background: "var(--gradient-success)"
      }, children: /* @__PURE__ */ jsx(BookOpen, { className: "h-8 w-8" }) }),
      /* @__PURE__ */ jsx("h2", { className: "mt-5 text-xl font-extrabold tracking-tight", children: "Journal coming next" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-xs text-sm text-muted-foreground", children: "Daily entries, weekly reviews, lesson logs, and goal tracking — all searchable and timestamped." })
    ] })
  ] });
}
export {
  JournalPage as component
};
