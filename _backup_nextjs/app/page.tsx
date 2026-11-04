"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { ShoppingBag } from "lucide-react";
import WelcomeScreen from "@/components/WelcomeScreen";
import CategoryFilter from "@/components/CategoryFilter";
import MenuGrid from "@/components/MenuGrid";
import ChatRoomCTA from "@/components/ChatRoomCTA";
import BucketDrawer, { type BucketItem } from "@/components/BucketDrawer";
import type { MenuItem } from "@/data/menu";

export default function Home() {
  const [welcomeExiting, setWelcomeExiting] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(true);
  const [category, setCategory] = useState<string>("");
  const [bucket, setBucket] = useState<BucketItem[]>([]);
  const [bucketOpen, setBucketOpen] = useState(false);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  // Link group chat diatur dari admin (/skyr-dash). Kosong = tombol disembunyikan.
  const [chatUrl, setChatUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/setting/chat", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setChatUrl(j?.url || null))
      .catch(() => setChatUrl(null));
  }, []);

  const handleEnter = useCallback(() => {
    if (welcomeExiting) return;
    setWelcomeExiting(true);
    setTimeout(() => setWelcomeVisible(false), 600);
  }, [welcomeExiting]);

  // Fetch menu + kategori dari database via /api/menu.
  // Tidak ada kategori "Semua" — pelanggan langsung melihat kategori pertama.
  useEffect(() => {
    let cancelled = false;
    async function fetchMenu() {
      try {
        const res = await fetch("/api/menu", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Gagal memuat menu");
        if (cancelled) return;
        const apiMenus: MenuItem[] = Array.isArray(json.data) ? json.data : [];
        const apiKategori: string[] = Array.isArray(json.kategori)
          ? json.kategori.map((k: { nama: string }) => k.nama)
          : [];
        setMenus(apiMenus);
        setCategories(apiKategori);
        setCategory((prev) => (apiKategori.includes(prev) ? prev : (apiKategori[0] ?? "")));
        setMenuError(false);
      } catch (e) {
        console.error("[menu]", e);
        if (!cancelled) setMenuError(true);
      } finally {
        if (!cancelled) setMenuLoading(false);
      }
    }
    fetchMenu();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retryMenu = useCallback(() => {
    setMenuLoading(true);
    setMenuError(false);
    setReloadKey((k) => k + 1);
  }, []);

  const filtered = useMemo(() => {
    return menus.filter((item) => {
      if (!category) return true;
      const ks = (item as MenuItem).kategoris;
      if (Array.isArray(ks) && ks.length > 0) return ks.some((k) => k.nama === category);
      return item.category === category;
    });
  }, [menus, category]);

  const getQty = useCallback((id: string | number) => bucket.find((b) => b.item.id === id)?.qty ?? 0, [bucket]);

  const onAdd = useCallback((item: MenuItem) => {
    setBucket((prev) => {
      const found = prev.find((b) => b.item.id === item.id);
      if (found) return prev.map((b) => (b.item.id === item.id ? { ...b, qty: b.qty + 1 } : b));
      return [...prev, { item, qty: 1, note: "" }];
    });
  }, []);

  const onInc = useCallback((id: string | number) => {
    setBucket((prev) => prev.map((b) => (b.item.id === id ? { ...b, qty: b.qty + 1 } : b)));
  }, []);

  const onDec = useCallback((id: string | number) => {
    setBucket((prev) => {
      const target = prev.find((b) => b.item.id === id);
      if (!target) return prev;
      if (target.qty <= 1) return prev.filter((b) => b.item.id !== id);
      return prev.map((b) => (b.item.id === id ? { ...b, qty: b.qty - 1 } : b));
    });
  }, []);

  const onRemove = useCallback((id: string | number) => {
    setBucket((prev) => prev.filter((b) => b.item.id !== id));
  }, []);

  const onNoteChange = useCallback((id: string | number, note: string) => {
    setBucket((prev) => prev.map((b) => (b.item.id === id ? { ...b, note } : b)));
  }, []);

  const onClear = useCallback(() => setBucket([]), []);

  const totalQty = bucket.reduce((s, b) => s + b.qty, 0);

  const [isStuck, setIsStuck] = useState(false);
  useEffect(() => {
    const onScroll = () => setIsStuck(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [welcomeVisible]);

  // Reset scroll ke atas saat pindah kategori
  const isFirstCategory = useRef(true);
  useEffect(() => {
    if (isFirstCategory.current) {
      isFirstCategory.current = false;
      return;
    }
    if (welcomeVisible) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [category, welcomeVisible]);

  return (
    <>
      {welcomeVisible && <WelcomeScreen onEnter={handleEnter} isExiting={welcomeExiting} />}

      <div className="relative flex min-h-dvh flex-col bg-[#0061a6] overflow-hidden">
        {/* Background swirl sama seperti welcome */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 400 800"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round">
              <path d="M -20 80 C 60 40, 140 120, 220 70 S 360 10, 420 90" strokeOpacity="0.14" strokeWidth="1.4" />
              <path d="M -20 140 C 70 110, 130 200, 240 160 S 360 90, 420 150" strokeOpacity="0.10" strokeWidth="1.2" />
              <path d="M -20 200 C 50 170, 160 260, 260 230 S 380 170, 420 220" strokeOpacity="0.12" strokeWidth="1.3" />
              <path d="M -20 300 C 80 240, 180 340, 280 300 S 380 260, 420 310" strokeOpacity="0.11" strokeWidth="1.1" />
              <path d="M -20 400 C 60 360, 150 460, 250 420 S 360 370, 420 420" strokeOpacity="0.09" strokeWidth="1.2" />
              <path d="M -20 520 C 90 470, 170 560, 270 530 S 370 490, 420 540" strokeOpacity="0.10" strokeWidth="1.0" />
              <path d="M -20 640 C 70 600, 160 700, 260 670 S 370 620, 420 680" strokeOpacity="0.11" strokeWidth="1.3" />
              <path d="M 40 0 C 90 80, 70 220, 140 320 S 180 520, 240 620 S 320 750, 360 800" strokeOpacity="0.07" strokeWidth="1.5" />
              <path d="M 160 0 C 180 100, 220 240, 180 360 S 260 580, 300 700" strokeOpacity="0.06" strokeWidth="1.2" />
              <path d="M 280 0 C 300 90, 320 200, 300 340 S 340 560, 380 680" strokeOpacity="0.07" strokeWidth="1.1" />
            </g>
            <g fill="none" stroke="white" strokeOpacity="0.04" strokeWidth="8">
              <path d="M -20 110 C 80 70, 180 140, 260 110 S 380 60, 420 120" />
              <path d="M -20 360 C 100 320, 200 420, 320 380 S 420 360, 420 400" />
              <path d="M -20 580 C 80 540, 180 640, 300 610" />
            </g>
          </svg>
        </div>

        {/* Filter + bucket liquid glass — fixed saat scroll dengan animasi */}
        <div className="fixed left-0 right-0 top-3 z-20 px-4 sm:px-6 pointer-events-none">
          <div
            className={`pointer-events-auto mx-auto flex max-w-fit items-center gap-2 rounded-full border p-1.5 pr-1.5 transition-all duration-300 ease-out sm:gap-3 sm:p-2 ${
              isStuck
                ? "bg-white/22 backdrop-blur-2xl border-white/30 shadow-[0_12px_40px_rgba(0,0,0,0.22),0_4px_16px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.35)] scale-[0.97] sm:scale-[0.98]"
                : "bg-white/14 backdrop-blur-xl border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.28)] scale-100"
            }`}
          >
            <div className="min-w-0 flex-1">
              {menuLoading ? (
                <div
                  className="flex gap-1.5"
                  aria-hidden
                  aria-label="Memuat kategori"
                >
                  {[88, 64, 80].map((w, i) => (
                    <div
                      key={i}
                      className="h-9 shrink-0 animate-pulse rounded-full bg-white/50 sm:h-10"
                      style={{ width: w }}
                    />
                  ))}
                </div>
              ) : (
                <CategoryFilter active={category} onChange={setCategory} categories={categories} />
              )}
            </div>
            <span className="h-7 w-px shrink-0 bg-white/20" aria-hidden />
            <button
              type="button"
              onClick={() => setBucketOpen(true)}
              aria-label={`Buka catatan, ${totalQty} item`}
              className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0061a6] px-3.5 py-2 text-sm font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition hover:bg-[#00548f] active:scale-[0.97] sm:gap-2 sm:px-4 sm:py-2.5"
            >
              <ShoppingBag size={16} className="shrink-0" />
              <span className="hidden sm:inline">Catatan</span>
              {totalQty > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-[#0061a6]">
                  {totalQty}
                </span>
              )}
            </button>
          </div>
        </div>

        <section id="menu" className="relative flex-1 pb-6 pt-20 sm:pb-8 sm:pt-24">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
            {chatUrl && <ChatRoomCTA href={chatUrl} />}
            {menuError && !menuLoading ? (
              <div className="mx-auto mt-6 max-w-sm rounded-[20px] bg-white px-6 py-6 text-center shadow-sm ring-1 ring-black/5">
                <p className="text-sm font-bold text-[#1f2937]">Menu belum bisa dimuat</p>
                <p className="mt-1 text-xs text-[#6b7280]">Periksa koneksi internet lalu coba lagi.</p>
                <button
                  type="button"
                  onClick={retryMenu}
                  className="mt-4 rounded-full bg-[#0061a6] px-5 py-2 text-sm font-bold text-white hover:bg-[#00548f] active:scale-[0.98]"
                >
                  Coba lagi
                </button>
              </div>
            ) : menuLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-[20px] bg-white/60 p-3 shadow-sm ring-1 ring-black/5">
                    <div className="aspect-[4/3] rounded-xl bg-white/80" />
                    <div className="mt-3 h-3 w-3/4 rounded bg-white/80" />
                    <div className="mt-2 h-2 w-full rounded bg-white/60" />
                    <div className="mt-3 h-8 rounded-full bg-white/70" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-1">
                <MenuGrid items={filtered} getQty={getQty} onAdd={onAdd} onInc={onInc} onDec={onDec} />
              </div>
            )}
          </div>
        </section>

        <footer className="relative bg-[#0061a6] py-6 text-center text-xs text-white/60 border-t border-white/10">
          © 2026 SKYR. All rights reserved.
        </footer>
      </div>

      <BucketDrawer
        open={bucketOpen}
        onClose={() => setBucketOpen(false)}
        items={bucket}
        onInc={onInc}
        onDec={onDec}
        onRemove={onRemove}
        onNoteChange={onNoteChange}
        onClear={onClear}
      />
    </>
  );
}
