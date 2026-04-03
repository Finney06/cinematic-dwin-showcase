import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { login, setToken } from "@/lib/adminApi";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(username, password);
      setToken(result.token);
      navigate("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5">
      {/* Background texture */}
      <div
        className="fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-10">
          <h1 className="text-[11px] tracking-[0.4em] uppercase text-white/20 font-medium">
            Dwindik
          </h1>
          <div className="w-6 h-px bg-white/10 mx-auto mt-3" />
          <p className="mt-3 text-[10px] tracking-[0.25em] uppercase text-white/15">
            Admin Portal
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-8 backdrop-blur-sm"
        >
          <h2 className="text-sm tracking-[0.15em] uppercase text-white/50 font-medium mb-8">
            Sign In
          </h2>

          {error && (
            <div className="mb-6 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-400/80">{error}</p>
            </div>
          )}
          {!error && reason === "session-expired" && (
            <div className="mb-6 px-3 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-300/80">
                Your session expired. Please sign in again to continue.
              </p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-white/25 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Enter username"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-white/25 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 bg-white/90 text-black text-xs tracking-[0.15em] uppercase font-medium py-3.5 rounded-lg hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black/60 rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-[10px] text-white/10 tracking-wide">
          ©2026 Dwindik CMS
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
