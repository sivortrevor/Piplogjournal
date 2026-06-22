import { Link } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PipLogLogo } from "@/components/brand/PipLogLogo";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <Link to="/" className="self-start">
        <PipLogLogo size={48} />
      </Link>
      <div className="mt-12 flex-1">
        <h1
          className="text-3xl font-extrabold tracking-tight"
          style={{ letterSpacing: "-0.025em" }}
        >
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </div>
      <div className="pt-6 text-center text-sm text-muted-foreground">{footer}</div>
    </main>
  );
}

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created! Welcome to PipLog.");
        window.location.href = "/app";
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        window.location.href = "/app";
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/app` },
      });
      if (error) throw error;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed";
      toast.error(msg);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={mode === "login" ? "Welcome back" : "Create your account"}
      subtitle={
        mode === "login"
          ? "Sign in to continue your trading journey."
          : "Start logging trades and master your edge."
      }
      footer={
        mode === "login" ? (
          <>
            New to PipLog?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Trader"
              className="mt-1.5 h-12 rounded-xl bg-input border-border"
            />
          </div>
        )}

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 h-12 rounded-xl bg-input border-border"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {mode === "login" && (
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot?
              </Link>
            )}
          </div>
          <Input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1.5 h-12 rounded-xl bg-input border-border"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="h-12 w-full rounded-xl text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow-primary)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : mode === "login" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={handleGoogle}
        disabled={submitting}
        className="h-12 w-full rounded-xl border-border bg-surface text-base font-medium hover:bg-accent"
      >
        <GoogleIcon /> Continue with Google
      </Button>
    </AuthShell>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 11v3.2h4.5c-.2 1.2-1.4 3.5-4.5 3.5-2.7 0-4.9-2.2-4.9-5s2.2-5 4.9-5c1.5 0 2.6.6 3.2 1.2l2.2-2.1C15.9 5.5 14.1 4.5 12 4.5 7.9 4.5 4.5 7.9 4.5 12s3.4 7.5 7.5 7.5c4.3 0 7.2-3 7.2-7.3 0-.5-.1-.9-.1-1.2H12z"
      />
    </svg>
  );
}
