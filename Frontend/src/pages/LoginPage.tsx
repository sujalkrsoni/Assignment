import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as { from?: string } | null)?.from ?? "/feed";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to login right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-6">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-linear-to-br from-violet-200/40 to-pink-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-linear-to-br from-purple-200/30 to-blue-200/30 rounded-full blur-3xl" />
      </div>

      <section className="relative w-full max-w-md bg-white/85 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-2xl shadow-purple-900/5 animate-fadeInUp">
        <div className="space-y-6">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                M
              </div>
              <span className="text-sm font-bold text-violet-600 tracking-wide">partywitty</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
              <p className="text-gray-500 mt-1">
                Sign in and start matching for tonight&apos;s plan.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-100 transition-all text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white focus:outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-100 transition-all text-sm"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5 active:translate-y-0 text-sm"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-center text-gray-500 text-sm">
              New here?{" "}
              <Link
                to="/register"
                className="font-bold text-violet-600 hover:text-violet-700 transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
