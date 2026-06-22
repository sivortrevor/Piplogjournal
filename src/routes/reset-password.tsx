import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PipLogLogo } from "@/components/brand/PipLogLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set new password — PipLog" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase handles the recovery token from the URL hash automatically;
    // a SIGNED_IN/PASSWORD_RECOVERY event fires once the session is set.
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // Also check current session in case event fired before listener
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. Welcome back!");
      navigate({ to: "/app" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <Link to="/login" className="self-start">
        <PipLogLogo size={48} />
      </Link>
      <div className="mt-12 flex-1">
        <h1 className="text-3xl font-extrabold tracking-tight" style={{ letterSpacing: "-0.025em" }}>
          Set a new password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a strong password to secure your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 h-12 rounded-xl bg-input border-border"
              placeholder="••••••••"
              disabled={!ready}
            />
            {!ready && (
              <p className="mt-2 text-xs text-muted-foreground">
                Verifying your reset link…
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={submitting || !ready}
            className="h-12 w-full rounded-xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]"
            style={{ background: "var(--gradient-primary)" }}
          >
            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update password"}
          </Button>
        </form>
      </div>
    </main>
  );
}
