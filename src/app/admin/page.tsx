
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed.");
      }

      setPassword("");
      router.push("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#FAFCFF] text-[#111B35] lg:grid-cols-2">

      <section className="relative hidden overflow-hidden bg-[#1739BA] px-14 py-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 top-24 h-96 w-96 rounded-full border-[65px] border-white/10" />
        <div className="absolute -bottom-48 -left-32 h-[500px] w-[500px] rounded-full border-[90px] border-[#FFE59B]/20" />

        <a href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FFE59B] text-[#1739BA]">
            <Sparkles size={24} />
          </div>
          <span className="text-3xl font-black tracking-[-0.08em]">
            AURELIA<span className="text-[#FFE59B]">.</span>
          </span>
        </a>

        <div className="relative z-10 max-w-xl">
          <div className="mb-9 inline-flex items-center gap-3 border border-white/25 bg-white/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em]">
            <ShieldCheck size={18} className="text-[#FFE59B]" />
            PRIVATE ADMINISTRATION
          </div>

          <h1 className="text-6xl font-black leading-[1.02] tracking-[-0.06em] xl:text-7xl">
            BEHIND
            <br />
            EVERY GREAT
            <br />
            <span className="text-[#FFE59B]">
              EXPERIENCE.
            </span>
          </h1>

          <p className="mt-9 max-w-lg text-base leading-8 text-blue-100">
            Your dedicated space for managing the AURELIA
            e-commerce experience. Oversee products, track
            inventory and maintain a beautifully curated
            digital storefront.
          </p>

          <div className="mt-12 flex flex-wrap gap-4">
            <div className="flex items-center gap-3 border border-white/20 bg-white/10 px-5 py-4">
              <ShoppingBag size={22} className="text-[#FFE59B]" />
              <span className="text-sm font-semibold">
                Product Management
              </span>
            </div>

            <div className="flex items-center gap-3 border border-white/20 bg-white/10 px-5 py-4">
              <LockKeyhole size={22} className="text-[#FFE59B]" />
              <span className="text-sm font-semibold">
                Secure Access
              </span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs tracking-widest text-blue-200">
          © 2026 AURELIA. PRIVATE ADMIN PORTAL.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-16 sm:px-12">
        <div className="w-full max-w-md">
          <a
            href="/"
            className="mb-12 inline-flex items-center gap-3 text-[#1739BA] lg:hidden"
          >
            <Sparkles size={28} />
            <span className="text-2xl font-black tracking-[-0.08em]">
              AURELIA.
            </span>
          </a>

          <div className="mb-10 flex h-16 w-16 items-center justify-center bg-[#FFE59B] text-[#1739BA]">
            <LockKeyhole size={32} />
          </div>

          <p className="mb-4 text-xs font-black uppercase tracking-[0.24em] text-[#1739BA]">
            AURELIA ADMINISTRATION
          </p>

          <h2 className="text-4xl font-black tracking-[-0.06em] sm:text-5xl">
            WELCOME
            <br />
            <span className="text-[#1739BA]">BACK.</span>
          </h2>

          <p className="mt-6 text-sm leading-8 text-slate-500">
            Enter your administrator password to continue
            to your private management dashboard.
          </p>

          <form onSubmit={handleLogin} className="mt-10 space-y-6">
            <div>
              <label
                htmlFor="admin-password"
                className="mb-3 block text-xs font-black uppercase tracking-widest text-slate-700"
              >
                Administrator Password
              </label>

              <div className="flex items-center border border-blue-200 bg-white focus-within:border-[#1739BA]">
                <LockKeyhole
                  size={20}
                  className="ml-5 shrink-0 text-[#1739BA]"
                />

                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your secure password"
                  autoComplete="current-password"
                  required
                  className="min-w-0 flex-1 bg-transparent px-4 py-5 text-sm outline-none"
                />

                <button
                  type="button"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-5 text-slate-500 hover:text-[#1739BA]"
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="flex w-full items-center justify-center gap-3 bg-[#1739BA] px-6 py-5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#0B287F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  SIGNING IN
                </>
              ) : (
                <>
                  ACCESS DASHBOARD
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 flex items-start gap-3 border-t border-blue-100 pt-7">
            <ShieldCheck
              size={21}
              className="shrink-0 text-[#1739BA]"
            />
            <p className="text-xs leading-6 text-slate-500">
              This administration area is restricted to
              authorised users. Authentication uses a
              signed, HTTP-only session cookie.
            </p>
          </div>

          <a
            href="/"
            className="mt-9 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1739BA] hover:underline"
          >
            <ArrowRight size={16} className="rotate-180" />
            RETURN TO STORE
          </a>
        </div>
      </section>
    </main>
  );
}
