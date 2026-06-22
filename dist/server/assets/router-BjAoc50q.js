import { jsx, jsxs } from "react/jsx-runtime";
import { createRootRoute, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter, useRouter } from "@tanstack/react-router";
import { useState, useEffect, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import { Toaster as Toaster$1 } from "sonner";
function createSupabaseClient() {
  const SUPABASE_URL = "https://hwcqtrwovbsdzxicikvn.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y3F0cndvdmJzZHp4aWNpa3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjAxNDMsImV4cCI6MjA5MjE5NjE0M30.5iecLDY1LSL9wH31dTW9aw2SzVIPu3pKlFysTikCdyM";
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== "undefined" ? localStorage : void 0,
      persistSession: true,
      autoRefreshToken: true
    }
  });
}
let _supabase;
const supabase = new Proxy({}, {
  get(_, prop, receiver) {
    if (!_supabase) _supabase = createSupabaseClient();
    return Reflect.get(_supabase, prop, receiver);
  }
});
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);
  const signOut = async () => {
    await supabase.auth.signOut();
  };
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { user, session, loading, signOut }, children });
}
function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
const Ctx = createContext(null);
const STORAGE_KEY = "piplog-theme";
function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}
function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("dark");
  useEffect(() => {
    const stored = (typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null) ?? "dark";
    setThemeState(stored);
    applyTheme(stored);
  }, []);
  const setTheme = (t) => {
    setThemeState(t);
    applyTheme(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
    }
  };
  return /* @__PURE__ */ jsx(
    Ctx.Provider,
    {
      value: {
        theme,
        setTheme,
        toggle: () => setTheme(theme === "dark" ? "light" : "dark")
      },
      children
    }
  );
}
function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTheme must be inside ThemeProvider");
  return v;
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const appCss = "/assets/styles-BQMOsGIV.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-extrabold gradient-text", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist." }),
    /* @__PURE__ */ jsx(
      "a",
      {
        href: "/",
        className: "mt-6 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]",
        style: { background: "var(--gradient-primary)" },
        children: "Go home"
      }
    )
  ] }) });
}
const Route$k = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0B1220" },
      { name: "author", content: "PipLog" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "PipLog" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/47f9acc2-f4ea-4671-ac51-3aae3ce749a0/id-preview-79bfe2f7--b01abdea-4831-4527-a451-45d43f42b683.lovable.app-1776647791078.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/47f9acc2-f4ea-4671-ac51-3aae3ce749a0/id-preview-79bfe2f7--b01abdea-4831-4527-a451-45d43f42b683.lovable.app-1776647791078.png" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "PipLog" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "application-name", content: "PipLog" },
      { name: "google-site-verification", content: "S_JVjLxEZzRNfe4r2-czBChCgLuKNQQQarynH_ErNGQ" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/icons/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-touch-icon.png" }
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "PipLog",
              url: "https://piplog-pro-journal.lovable.app",
              logo: "https://piplog-pro-journal.lovable.app/icons/icon-512.png"
            },
            {
              "@type": "WebSite",
              name: "PipLog",
              url: "https://piplog-pro-journal.lovable.app",
              description: "PipLog is a premium forex trading journal and analytics app for traders to log trades, master discipline, and grow consistently."
            }
          ]
        })
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "dark", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  return /* @__PURE__ */ jsx(ThemeProvider, { children: /* @__PURE__ */ jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { position: "top-center", richColors: true, closeButton: true })
  ] }) });
}
const $$splitComponentImporter$i = () => import("./trust-C4JjN6iA.js");
const Route$j = createFileRoute("/trust")({
  head: () => ({
    meta: [{
      title: "Trust, Security & Privacy — PipLog"
    }, {
      name: "description",
      content: "How PipLog protects your trading data: authentication, encryption, row-level security, and your privacy rights."
    }, {
      property: "og:title",
      content: "Trust, Security & Privacy — PipLog"
    }, {
      property: "og:description",
      content: "Learn how PipLog secures your account and trading data, and how we handle your personal information."
    }, {
      property: "og:url",
      content: "https://piplog-pro-journal.lovable.app/trust"
    }],
    links: [{
      rel: "canonical",
      href: "https://piplog-pro-journal.lovable.app/trust"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const BASE_URL = "https://piplog-pro-journal.lovable.app";
const Route$i = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/onboarding", changefreq: "monthly", priority: "0.7" },
          { path: "/login", changefreq: "monthly", priority: "0.5" },
          { path: "/register", changefreq: "monthly", priority: "0.7" },
          { path: "/forgot-password", changefreq: "yearly", priority: "0.3" }
        ];
        const urls = entries.map(
          (e) => [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`
          ].filter(Boolean).join("\n")
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$h = () => import("./reset-password-EJ7ygidp.js");
const Route$h = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{
      title: "Set new password — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./register-BFE-h0ZR.js");
const Route$g = createFileRoute("/register")({
  head: () => ({
    meta: [{
      title: "Create your PipLog account — Forex Trading Journal"
    }, {
      name: "description",
      content: "Create a free PipLog account to start logging your forex trades, tracking analytics, and growing as a trader."
    }, {
      property: "og:title",
      content: "Create your PipLog account"
    }, {
      property: "og:description",
      content: "Start your premium forex trading journal — log trades, review data, master discipline."
    }, {
      property: "og:url",
      content: "https://piplog-pro-journal.lovable.app/register"
    }],
    links: [{
      rel: "canonical",
      href: "https://piplog-pro-journal.lovable.app/register"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./onboarding-CLobQhhE.js");
const Route$f = createFileRoute("/onboarding")({
  head: () => ({
    meta: [{
      title: "Welcome to PipLog — Get Started"
    }, {
      name: "description",
      content: "Get started with PipLog, your premium forex trading journal. Learn how to track trades, review your data, and trade with discipline."
    }, {
      property: "og:title",
      content: "Welcome to PipLog — Get Started"
    }, {
      property: "og:description",
      content: "A quick tour of PipLog — the premium forex trading journal for serious traders."
    }, {
      property: "og:url",
      content: "https://piplog-pro-journal.lovable.app/onboarding"
    }],
    links: [{
      rel: "canonical",
      href: "https://piplog-pro-journal.lovable.app/onboarding"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./login-Bm54KM7T.js");
const Route$e = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Sign in to PipLog — Forex Trading Journal"
    }, {
      name: "description",
      content: "Sign in to PipLog to access your forex trading journal, review trades, and track your performance."
    }, {
      property: "og:title",
      content: "Sign in to PipLog"
    }, {
      property: "og:description",
      content: "Sign in to your PipLog account to continue journaling your forex trades."
    }, {
      property: "og:url",
      content: "https://piplog-pro-journal.lovable.app/login"
    }],
    links: [{
      rel: "canonical",
      href: "https://piplog-pro-journal.lovable.app/login"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./forgot-password-C4mSMv7y.js");
const Route$d = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{
      title: "Reset password — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./app-D2_FgmGb.js");
const Route$c = createFileRoute("/app")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./index-BAChJ_mt.js");
const Route$b = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "PipLog — The Premium Forex Trading Journal"
    }, {
      name: "description",
      content: "PipLog is a premium forex trading journal that helps you log every trade, analyze performance, master your emotions, and grow consistently with data-driven insights."
    }, {
      property: "og:title",
      content: "PipLog — The Premium Forex Trading Journal"
    }, {
      property: "og:description",
      content: "Log every trade, analyze performance, and master discipline with PipLog — a premium forex trading journal built for serious traders."
    }, {
      property: "og:url",
      content: "https://piplog-pro-journal.lovable.app/"
    }],
    links: [{
      rel: "canonical",
      href: "https://piplog-pro-journal.lovable.app/"
    }]
  }),
  // Client-side: if already signed in, jump straight to the app
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const {
      data
    } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({
        to: "/app"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./app.index-CMiuiV7G.js");
const Route$a = createFileRoute("/app/")({
  head: () => ({
    meta: [{
      title: "Dashboard — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./app.trades-C7Sav0cd.js");
const Route$9 = createFileRoute("/app/trades")({
  head: () => ({
    meta: [{
      title: "Trade History — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./app.settings-DwsjBIPI.js");
const Route$8 = createFileRoute("/app/settings")({
  head: () => ({
    meta: [{
      title: "Settings — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./app.profile-CCpIKvgK.js");
const Route$7 = createFileRoute("/app/profile")({
  head: () => ({
    meta: [{
      title: "Profile — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./app.journal-3vlmei8I.js");
const Route$6 = createFileRoute("/app/journal")({
  head: () => ({
    meta: [{
      title: "Journal — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./app.import-4LFl7Map.js");
const Route$5 = createFileRoute("/app/import")({
  head: () => ({
    meta: [{
      title: "Import Trades — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./app.calendar-D95kZGeb.js");
const Route$4 = createFileRoute("/app/calendar")({
  head: () => ({
    meta: [{
      title: "Calendar — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./app.analytics-4xxbjARp.js");
const Route$3 = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [{
      title: "Analytics — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./app.add-DiYsldc5.js");
const Route$2 = createFileRoute("/app/add")({
  head: () => ({
    meta: [{
      title: "Add Trade — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./app.trades._tradeId-DVKZ8RMd.js");
const Route$1 = createFileRoute("/app/trades/$tradeId")({
  head: () => ({
    meta: [{
      title: "Trade — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./app.trades._tradeId.edit-BGmVEMaK.js");
const Route = createFileRoute("/app/trades/$tradeId/edit")({
  head: () => ({
    meta: [{
      title: "Edit Trade — PipLog"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TrustRoute = Route$j.update({
  id: "/trust",
  path: "/trust",
  getParentRoute: () => Route$k
});
const SitemapDotxmlRoute = Route$i.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$k
});
const ResetPasswordRoute = Route$h.update({
  id: "/reset-password",
  path: "/reset-password",
  getParentRoute: () => Route$k
});
const RegisterRoute = Route$g.update({
  id: "/register",
  path: "/register",
  getParentRoute: () => Route$k
});
const OnboardingRoute = Route$f.update({
  id: "/onboarding",
  path: "/onboarding",
  getParentRoute: () => Route$k
});
const LoginRoute = Route$e.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$k
});
const ForgotPasswordRoute = Route$d.update({
  id: "/forgot-password",
  path: "/forgot-password",
  getParentRoute: () => Route$k
});
const AppRoute = Route$c.update({
  id: "/app",
  path: "/app",
  getParentRoute: () => Route$k
});
const IndexRoute = Route$b.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$k
});
const AppIndexRoute = Route$a.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppRoute
});
const AppTradesRoute = Route$9.update({
  id: "/trades",
  path: "/trades",
  getParentRoute: () => AppRoute
});
const AppSettingsRoute = Route$8.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AppRoute
});
const AppProfileRoute = Route$7.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => AppRoute
});
const AppJournalRoute = Route$6.update({
  id: "/journal",
  path: "/journal",
  getParentRoute: () => AppRoute
});
const AppImportRoute = Route$5.update({
  id: "/import",
  path: "/import",
  getParentRoute: () => AppRoute
});
const AppCalendarRoute = Route$4.update({
  id: "/calendar",
  path: "/calendar",
  getParentRoute: () => AppRoute
});
const AppAnalyticsRoute = Route$3.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => AppRoute
});
const AppAddRoute = Route$2.update({
  id: "/add",
  path: "/add",
  getParentRoute: () => AppRoute
});
const AppTradesTradeIdRoute = Route$1.update({
  id: "/$tradeId",
  path: "/$tradeId",
  getParentRoute: () => AppTradesRoute
});
const AppTradesTradeIdEditRoute = Route.update({
  id: "/edit",
  path: "/edit",
  getParentRoute: () => AppTradesTradeIdRoute
});
const AppTradesTradeIdRouteChildren = {
  AppTradesTradeIdEditRoute
};
const AppTradesTradeIdRouteWithChildren = AppTradesTradeIdRoute._addFileChildren(AppTradesTradeIdRouteChildren);
const AppTradesRouteChildren = {
  AppTradesTradeIdRoute: AppTradesTradeIdRouteWithChildren
};
const AppTradesRouteWithChildren = AppTradesRoute._addFileChildren(
  AppTradesRouteChildren
);
const AppRouteChildren = {
  AppAddRoute,
  AppAnalyticsRoute,
  AppCalendarRoute,
  AppImportRoute,
  AppJournalRoute,
  AppProfileRoute,
  AppSettingsRoute,
  AppTradesRoute: AppTradesRouteWithChildren,
  AppIndexRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren,
  ForgotPasswordRoute,
  LoginRoute,
  OnboardingRoute,
  RegisterRoute,
  ResetPasswordRoute,
  SitemapDotxmlRoute,
  TrustRoute
};
const routeTree = Route$k._addFileChildren(rootRouteChildren)._addFileTypes();
function DefaultErrorComponent({ error, reset }) {
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10", children: /* @__PURE__ */ jsx(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-8 w-8 text-destructive",
        fill: "none",
        viewBox: "0 0 24 24",
        stroke: "currentColor",
        strokeWidth: 2,
        children: /* @__PURE__ */ jsx(
          "path",
          {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          }
        )
      }
    ) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "An unexpected error occurred. Please try again." }),
    false,
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const getRouter = () => {
  const router2 = createRouter({
    routeTree,
    context: {},
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: DefaultErrorComponent
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$1 as R,
  useTheme as a,
  Route as b,
  router as r,
  supabase as s,
  useAuth as u
};
