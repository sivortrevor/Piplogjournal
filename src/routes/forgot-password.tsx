import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PipLogLogo } from "@/components/brand/PipLogLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — PipLog" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your email for a reset link");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <Link to="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>

      <div className="mt-12 flex-1">
        <PipLogLogo size={48} />
        <h1 className="mt-10 text-3xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.025em" }}>
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we'll send you a secure reset link.
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl surface-card p-6 text-sm">
            <p className="font-medium">Email sent ✓</p>
            <p className="mt-2 text-muted-foreground">
              We sent a password reset link to <span className="text-foreground">{email}</span>.
              Check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 h-12 rounded-xl bg-input border-border"
                placeholder="you@example.com"
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send reset link"}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
