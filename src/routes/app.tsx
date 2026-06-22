import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { BottomNav } from "@/components/layout/BottomNav";
import { PipLogLogo } from "@/components/brand/PipLogLogo";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <PipLogLogo size={64} />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-md pb-28">
      <Outlet />
      <BottomNav />
    </div>
  );
}
