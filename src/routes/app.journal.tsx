import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/app/journal")({
  head: () => ({ meta: [{ title: "Journal — PipLog" }] }),
  component: JournalPage,
});

function JournalPage() {
  return (
    <div className="px-5 pt-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.025em" }}>
          Journal
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Daily reflections, lessons, and goals.</p>
      </header>

      <div className="surface-card mt-8 flex flex-col items-center rounded-3xl p-8 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-white"
          style={{ background: "var(--gradient-success)" }}
        >
          <BookOpen className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-xl font-extrabold tracking-tight">Journal coming next</h2>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Daily entries, weekly reviews, lesson logs, and goal tracking — all searchable and timestamped.
        </p>
      </div>
    </div>
  );
}
