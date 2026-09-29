import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearToken } from "@/lib/adminApi";

export default function AdminRecovery({ reset = false }: { reset?: boolean }) {
  const navigate = useNavigate();
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("token") || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputClass = "w-full mt-2 bg-white/[0.04] border border-white/15 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-white/50";
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(""); setMessage("");
    if (reset && password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const base = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
      const response = await fetch(`${base}/auth/${reset ? "reset-password" : "forgot-password"}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reset ? { token, newPassword: password } : { username }),
      });
      const result = await response.json().catch(() => ({ error: "The server is unavailable. Please try again later." }));
      if (!response.ok) throw new Error(result.error || "Unable to complete request.");
      if (reset) {
        clearToken();
        navigate("/admin/login?reason=password-changed", { replace: true });
      } else setMessage(result.message);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to connect to the server."); }
    finally { setBusy(false); }
  }
  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-5 text-white">
      <div className="w-full max-w-sm">
        <p className="text-center text-xs tracking-[0.3em] text-white/50 mb-8">CRA8 · ADMIN PORTAL</p>
        <form onSubmit={submit} className="bg-white/[0.02] border border-white/10 rounded-xl p-8 space-y-5">
          <h1 className="text-sm tracking-[0.15em] uppercase">{reset ? "Choose a new password" : "Forgot password?"}</h1>
          <p className="text-sm text-white/60">{reset ? "Use at least 12 characters with uppercase, lowercase, a number and a symbol (maximum 72 UTF-8 bytes). All devices will be signed out." : "Enter your admin username. We’ll send a reset link to your configured recovery email."}</p>
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          {message && <p role="status" className="text-sm text-green-300">{message}</p>}
          {reset ? <>
            {!token && <p role="alert" className="text-sm text-amber-300">This link is missing its reset token. Request a new link below.</p>}
            <label className="block text-xs text-white/70">New password<input className={inputClass} type="password" autoComplete="new-password" required minLength={12} value={password} onChange={e => setPassword(e.target.value)} /></label>
            <label className="block text-xs text-white/70">Confirm password<input className={inputClass} type="password" autoComplete="new-password" required minLength={12} value={confirm} onChange={e => setConfirm(e.target.value)} /></label>
          </> : <label className="block text-xs text-white/70">Username<input className={inputClass} autoComplete="username" required maxLength={255} value={username} onChange={e => setUsername(e.target.value)} /></label>}
          <button disabled={busy || (reset && !token)} className="w-full bg-white/90 text-black text-xs tracking-widest uppercase py-3.5 rounded-lg disabled:opacity-40">{busy ? "Please wait…" : reset ? "Reset password" : "Send reset link"}</button>
          {reset && <Link className="block text-sm text-white/70 underline text-center" to="/admin/forgot-password">Request a new reset link</Link>}
          <Link className="block text-sm text-white/70 underline text-center" to="/admin/login">Back to sign in</Link>
        </form>
      </div>
    </main>
  );
}
