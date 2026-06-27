"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Account created! Check your email for a confirmation link, or sign in directly if email confirmation is disabled.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#121417" }}
    >
      <div
        className="w-full max-w-sm rounded-xl p-8"
        style={{ backgroundColor: "#1E2024", border: "1px solid #2C2E33" }}
      >
        <h1
          className="text-xl font-semibold mb-1"
          style={{ color: "#E8EAED" }}
        >
          WorksheetGen
        </h1>
        <p className="text-sm mb-6" style={{ color: "#9AA0A6" }}>
          {mode === "signin" ? "Sign in to your account" : "Create a new account"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#9AA0A6" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "#121417",
                border: "1px solid #2C2E33",
                color: "#E8EAED",
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#9AA0A6" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "#121417",
                border: "1px solid #2C2E33",
                color: "#E8EAED",
              }}
            />
          </div>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: "#2C1A1A", color: "#F28B82" }}>
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: "#1A2C1A", color: "#81C995" }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg py-2 text-sm font-medium transition-opacity"
            style={{
              backgroundColor: "#4D528A",
              color: "#E8EAED",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm" style={{ color: "#9AA0A6" }}>
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}
            className="underline"
            style={{ color: "#8B8FD4" }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
