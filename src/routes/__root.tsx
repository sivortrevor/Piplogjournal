import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold gradient-text">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <a
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          Go home
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
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
      { name: "google-site-verification", content: "S_JVjLxEZzRNfe4r2-czBChCgLuKNQQQarynH_ErNGQ" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/icons/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-touch-icon.png" },
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
              logo: "https://piplog-pro-journal.lovable.app/icons/icon-512.png",
            },
            {
              "@type": "WebSite",
              name: "PipLog",
              url: "https://piplog-pro-journal.lovable.app",
              description:
                "PipLog is a premium forex trading journal and analytics app for traders to log trades, master discipline, and grow consistently.",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-center" richColors closeButton />
      </AuthProvider>
    </ThemeProvider>
  );
}
