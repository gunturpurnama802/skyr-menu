"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || "Login gagal");
      router.push("/skyr-dash");
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#0061a6] p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <div className="text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#0061a6] text-white font-black">S</div>
          <h1 className="mt-3 text-lg font-extrabold text-[#1f2937]">SKYR Dash</h1>
          <p className="text-xs text-[#6b7280]">Login admin untuk mengelola menu & kategori</p>
        </div>
        {err && <div className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600 ring-1 ring-red-200">{err}</div>}
        <label className="mt-4 block">
          <span className="text-xs font-semibold text-[#374151]">Username</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#0061a6]/40 focus:ring-4 focus:ring-[#0061a6]/10" placeholder="Masukkan username" />
        </label>
        <label className="mt-3 block">
          <span className="text-xs font-semibold text-[#374151]">Password</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-[#0061a6]/40 focus:ring-4 focus:ring-[#0061a6]/10" placeholder="••••••••" />
        </label>
        <button disabled={loading} type="submit" className="mt-5 w-full rounded-full bg-[#0061a6] py-3 text-sm font-bold text-white hover:bg-[#00548f] disabled:opacity-60">
          {loading ? "Memproses..." : "Masuk"}
        </button>
        <Link href="/" className="mt-3 block text-center text-xs text-[#6b7280] hover:text-[#0061a6]">← Kembali ke Menu</Link>
      </form>
    </div>
  );
}
