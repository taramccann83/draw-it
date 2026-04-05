"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <Image
          src="/logo.png"
          alt="Draw It! logo"
          width={48}
          height={48}
          className="rounded-full"
        />
        <span className="text-3xl font-black font-headline tracking-tight">
          Draw{" "}
          <span className="bg-gradient-to-r from-primary to-secondary-fixed-dim bg-clip-text text-transparent">
            It!
          </span>
        </span>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-xl p-8 shadow-sm">
        <h1 className="text-2xl font-extrabold font-headline text-center mb-6">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-on-surface-variant mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-lg border border-outline-variant bg-surface focus:outline-none focus:ring-2 focus:ring-primary text-on-surface"
              placeholder="At least 6 characters"
            />
          </div>

          {error && (
            <p className="text-error text-sm font-medium">{error}</p>
          )}

          {message && (
            <p className="text-tertiary text-sm font-medium">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-primary to-secondary-fixed-dim text-white font-black font-headline text-lg active:scale-95 transition-all duration-300 disabled:opacity-50"
          >
            {loading
              ? "Loading..."
              : isSignUp
              ? "Sign Up"
              : "Log In"}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant mt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
              setMessage("");
            }}
            className="text-primary font-semibold hover:underline"
          >
            {isSignUp ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}
