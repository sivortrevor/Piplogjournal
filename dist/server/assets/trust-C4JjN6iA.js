import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
function TrustPage() {
  return /* @__PURE__ */ jsx("main", { className: "min-h-screen bg-background text-foreground px-6 py-12", children: /* @__PURE__ */ jsxs("article", { className: "mx-auto max-w-2xl space-y-8", children: [
    /* @__PURE__ */ jsxs("header", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-extrabold gradient-text", children: "Trust, Security & Privacy" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "PipLog is built for serious traders. Your journal, trades, and notes are personal — here is how we protect them." })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Account security" }),
      /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-5 space-y-1 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx("li", { children: "Email/password and Google sign-in handled by a managed authentication provider." }),
        /* @__PURE__ */ jsx("li", { children: "Sessions use short-lived access tokens with automatic refresh." }),
        /* @__PURE__ */ jsx("li", { children: "Passwords are hashed by the auth provider — we never see or store them." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Data protection" }),
      /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-5 space-y-1 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx("li", { children: "All traffic is served over HTTPS/TLS." }),
        /* @__PURE__ */ jsx("li", { children: "Your trades, journal entries, and profile are isolated by row-level security — only your authenticated account can read or modify them." }),
        /* @__PURE__ */ jsx("li", { children: "Subscription plan changes are server-side only and cannot be self-elevated." }),
        /* @__PURE__ */ jsx("li", { children: "Trade screenshots are stored in a private bucket and served via short-lived signed URLs." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Privacy" }),
      /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-5 space-y-1 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx("li", { children: "We collect only what's needed to operate the journal: account info and the trades you log." }),
        /* @__PURE__ */ jsx("li", { children: "We do not sell your data and do not share it with third parties for advertising." }),
        /* @__PURE__ */ jsx("li", { children: "You can request export or deletion of your account by contacting support." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "Reporting an issue" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "If you believe you've found a security vulnerability, please contact us so we can investigate and address it promptly." })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "This page describes controls implemented in the PipLog application. It is not a third-party audit or certification." }),
    /* @__PURE__ */ jsx(Link, { to: "/", className: "inline-block text-sm font-medium text-primary hover:underline", children: "← Back to home" })
  ] }) });
}
export {
  TrustPage as component
};
