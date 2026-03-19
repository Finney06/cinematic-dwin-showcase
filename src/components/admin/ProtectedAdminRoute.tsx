import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

interface ProtectedAdminRouteProps {
  children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const { session, loading } = useSupabaseAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground grid place-items-center px-6">
        <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">Checking access...</p>
      </main>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
