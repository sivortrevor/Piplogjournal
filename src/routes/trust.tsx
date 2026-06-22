import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/trust")({
  head: () => ({
    meta: [
      { title: "Trust, Security & Privacy — PipLog" },
      {
        name: "description",
        content:
          "How PipLog protects your trading data: authentication, encryption, row-level security, and your privacy rights.",
      },
      { property: "og:title", content: "Trust, Security & Privacy — PipLog" },
      {
        property: "og:description",
        content:
          "Learn how PipLog secures your account and trading data, and how we handle your personal information.",
      },
      { property: "og:url", content: "https://piplog-pro-journal.lovable.app/trust" },
    ],
    links: [{ rel: "canonical", href: "https://piplog-pro-journal.lovable.app/trust" }],
  }),
  component: TrustPage,
});

function TrustPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-12">
      <article className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold gradient-text">Trust, Security & Privacy</h1>
          <p className="text-sm text-muted-foreground">
            PipLog is built for serious traders. Your journal, trades, and notes are personal — here is
            how we protect them.
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Account security</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Email/password and Google sign-in handled by a managed authentication provider.</li>
            <li>Sessions use short-lived access tokens with automatic refresh.</li>
            <li>Passwords are hashed by the auth provider — we never see or store them.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Data protection</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>All traffic is served over HTTPS/TLS.</li>
            <li>
              Your trades, journal entries, and profile are isolated by row-level security — only
              your authenticated account can read or modify them.
            </li>
            <li>Subscription plan changes are server-side only and cannot be self-elevated.</li>
            <li>Trade screenshots are stored in a private bucket and served via short-lived signed URLs.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Privacy</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>We collect only what's needed to operate the journal: account info and the trades you log.</li>
            <li>We do not sell your data and do not share it with third parties for advertising.</li>
            <li>You can request export or deletion of your account by contacting support.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Reporting an issue</h2>
          <p className="text-sm text-muted-foreground">
            If you believe you've found a security vulnerability, please contact us so we can
            investigate and address it promptly.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          This page describes controls implemented in the PipLog application. It is not a
          third-party audit or certification.
        </p>

        <Link to="/" className="inline-block text-sm font-medium text-primary hover:underline">
          ← Back to home
        </Link>
      </article>
    </main>
  );
}
