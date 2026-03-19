import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const AdminLogin = () => {
  const { session, loading } = useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setError(null);
  }, [email, password]);

  if (!loading && session) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase || !isSupabaseConfigured) {
      setError("Supabase environment variables are not configured yet.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    }

    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-16">
      <section className="w-full max-w-md border border-border bg-card/40 backdrop-blur-sm p-8 rounded-xl">
        <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">Dwindik CMS</p>
        <h1 className="font-display text-4xl font-light tracking-[0.02em] mb-8">Admin Login</h1>

        {!isSupabaseConfigured && (
          <div className="mb-6 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Supabase is not connected yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-foreground block mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@dwindik.com"
              required
            />
          </div>

          <div>
            <label className="font-body text-[10px] tracking-[0.24em] uppercase text-muted-foreground block mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={!isSupabaseConfigured || isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </section>
    </main>
  );
};

export default AdminLogin;
