"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Search,
  Upload,
  ImageIcon,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  ArrowUpDown,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

type Kategori = {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  urutan: number;
  _count?: { menus: number };
};
type Menu = {
  id: string;
  nama: string;
  deskripsi: string;
  deskripsiPanjang: string | null;
  harga: number;
  gambar: string | null;
  tersedia: boolean;
  urutan?: number;
  kategoriId?: string;
  kategoris?: { id: string; nama: string; slug: string }[];
  kategori?: { id: string; nama: string; slug: string };
};

export default function DashPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<"kategori" | "menu" | "chat">("kategori");

  // kategori state
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [kategoriOriginal, setKategoriOriginal] = useState<string[]>([]);
  const [kLoading, setKLoading] = useState(true);
  const [kSavingOrder, setKSavingOrder] = useState(false);
  const [kFormOpen, setKFormOpen] = useState(false);
  const [kEditing, setKEditing] = useState<Kategori | null>(null);
  const [kNama, setKNama] = useState("");
  const [kDeskripsi, setKDeskripsi] = useState("");
  const [kSubmitting, setKSubmitting] = useState(false);

  // menu state
  const [menus, setMenus] = useState<Menu[]>([]);
  const [mLoading, setMLoading] = useState(true);
  const [mFormOpen, setMFormOpen] = useState(false);
  const [mEditing, setMEditing] = useState<Menu | null>(null);
  const [mQ, setMQ] = useState("");
  const [mFilterKategori, setMFilterKategori] = useState("all");
  const [mNama, setMNama] = useState("");
  const [mDeskripsi, setMDeskripsi] = useState("");
  const [mDeskripsiPanjang, setMDeskripsiPanjang] = useState("");
  const [mHarga, setMHarga] = useState("");
  const [mGambar, setMGambar] = useState("");
  const [mTersedia, setMTersedia] = useState(true);
  const [mKategoriIds, setMKategoriIds] = useState<string[]>([]);
  const [mUploading, setMUploading] = useState(false);
  const [mUploadError, setMUploadError] = useState<string | null>(null);
  const [mSubmitting, setMSubmitting] = useState(false);
  const [mOriginalOrderIds, setMOriginalOrderIds] = useState<string[]>([]);
  const [mSavingOrder, setMSavingOrder] = useState(false);

  // room chat state
  const [chatUrl, setChatUrl] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(true);
  const [chatSubmitting, setChatSubmitting] = useState(false);

  const checkAuth = useCallback(async () => {
    const res = await fetch("/api/auth/me");
    if (!res.ok) {
      router.replace("/skyr-dash/login");
      return false;
    }
    setAuthChecked(true);
    return true;
  }, [router]);

  const fetchKategori = useCallback(async () => {
    const res = await fetch("/api/admin/kategori");
    if (res.status === 401) {
      router.replace("/skyr-dash/login");
      return;
    }
    const j = await res.json();
    if (j.success) {
      const list: Kategori[] = j.data;
      setKategori(list);
      setKategoriOriginal(list.map((k) => k.id));
    }
    setKLoading(false);
  }, [router]);

  const fetchMenus = useCallback(async () => {
    const res = await fetch("/api/admin/menu");
    if (res.status === 401) {
      router.replace("/skyr-dash/login");
      return;
    }
    const j = await res.json();
    if (j.success) {
      const list: Menu[] = j.data;
      setMenus(list);
      setMOriginalOrderIds(list.map((m) => m.id));
    }
    setMLoading(false);
  }, [router]);

  const fetchChatLink = useCallback(async () => {
    const res = await fetch("/api/admin/chat-link");
    if (res.status === 401) {
      router.replace("/skyr-dash/login");
      return;
    }
    const j = await res.json().catch(() => ({}));
    if (j.success) {
      setChatUrl(j.url || null);
      setChatInput(j.url || "");
    }
    setChatLoading(false);
  }, [router]);

  useEffect(() => {
    // Semua setState di fungsi-fungsi ini terjadi setelah await fetch (async),
    // bukan sinkron di body effect — rule ini tidak bisa melihatnya lewat pemanggilan fungsi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkAuth().then((ok) => {
      if (ok) {
        fetchKategori();
        fetchMenus();
        fetchChatLink();
      }
    });
  }, [checkAuth, fetchKategori, fetchMenus, fetchChatLink]);

  async function saveChatLink(e: React.FormEvent) {
    e.preventDefault();
    if (chatSubmitting) return;
    setChatSubmitting(true);
    try {
      const res = await fetch("/api/admin/chat-link", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: chatInput }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) {
        alert(j.error || "Gagal simpan link");
        return;
      }
      setChatUrl(j.url);
      setChatInput(j.url);
    } finally {
      setChatSubmitting(false);
    }
  }
  async function deleteChatLink() {
    if (!confirm("Hapus link group chat? Tombol room chat akan hilang dari menu.")) return;
    setChatSubmitting(true);
    try {
      const res = await fetch("/api/admin/chat-link", { method: "DELETE" });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) {
        alert(j.error || "Gagal hapus link");
        return;
      }
      setChatUrl(null);
      setChatInput("");
    } finally {
      setChatSubmitting(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/skyr-dash/login");
  }

  // ===== Urutan kategori — tombol naik/turun =====
  function moveKategori(id: string, dir: -1 | 1) {
    setKategori((prev) => {
      const from = prev.findIndex((k) => k.id === id);
      const to = from + dir;
      if (from === -1 || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }
  function resetKategoriOrder() {
    setKategori((prev) => {
      const byId = new Map(prev.map((k) => [k.id, k]));
      return kategoriOriginal
        .map((id) => byId.get(id))
        .filter((k): k is Kategori => Boolean(k));
    });
  }

  // ===== Urutan menu per kategori — tombol naik/turun =====
  // Menggeser posisi di dalam daftar kategori yang sedang dipilih
  // (tukar dengan tetangga atas/bawah di kategori tersebut).
  // Disimpan sebagai urutan global via API yang sama; karena tampilan
  // pelanggan kini selalu per kategori, urutan tiap kategori tetap benar.
  function moveMenu(id: string, dir: -1 | 1) {
    const ids = filteredMenus.map((m) => m.id);
    const pos = ids.indexOf(id);
    const otherId = ids[pos + dir];
    if (pos === -1 || !otherId) return;
    setMenus((prev) => {
      const next = [...prev];
      const i = next.findIndex((m) => m.id === id);
      const j = next.findIndex((m) => m.id === otherId);
      if (i === -1 || j === -1) return prev;
      const tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
      return next;
    });
  }
  function resetMenuOrder() {
    setMenus((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      const restored = mOriginalOrderIds
        .map((id) => byId.get(id))
        .filter((m): m is Menu => Boolean(m));
      // menu baru yang belum ada di snapshot ikut di belakang
      const known = new Set(restored.map((m) => m.id));
      return [...restored, ...prev.filter((m) => !known.has(m.id))];
    });
  }
  const menuChanged =
    JSON.stringify(menus.map((m) => m.id)) !==
    JSON.stringify(mOriginalOrderIds);
  async function saveMenuOrder() {
    setMSavingOrder(true);
    const res = await fetch("/api/admin/menu/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: menus.map((m) => m.id) }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.success) alert(j.error || "Gagal simpan urutan menu");
    else {
      setMOriginalOrderIds(menus.map((m) => m.id));
      alert("Urutan menu disimpan");
    }
    setMSavingOrder(false);
  }

  const kategoriChanged =
    JSON.stringify(kategori.map((k) => k.id)) !==
    JSON.stringify(kategoriOriginal);

  async function saveOrder() {
    setKSavingOrder(true);
    const res = await fetch("/api/admin/kategori/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: kategori.map((k) => k.id) }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.success) alert(j.error || "Gagal simpan urutan");
    else {
      setKategoriOriginal(kategori.map((k) => k.id));
      alert("Urutan kategori disimpan");
    }
    setKSavingOrder(false);
  }

  async function submitKategori(e: React.FormEvent) {
    e.preventDefault();
    if (kSubmitting) return;
    setKSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        nama: kNama,
        deskripsi: kDeskripsi,
      };
      if (kEditing) payload.id = kEditing.id;
      const res = await fetch("/api/admin/kategori", {
        method: kEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) {
        alert(j.error || "Gagal simpan");
        return;
      }
      setKFormOpen(false);
      setKEditing(null);
      setKNama("");
      setKDeskripsi("");
      fetchKategori();
    } finally {
      setKSubmitting(false);
    }
  }
  async function deleteKategori(id: string) {
    if (!confirm("Hapus kategori? Akan gagal jika masih dipakai menu.")) return;
    const res = await fetch(`/api/admin/kategori?id=${id}`, {
      method: "DELETE",
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.success)
      alert(j.error || "Gagal hapus — kategori masih dipakai menu");
    else fetchKategori();
  }
  function openEditKategori(k: Kategori) {
    setKEditing(k);
    setKNama(k.nama);
    setKDeskripsi(k.deskripsi || "");
    setKFormOpen(true);
  }

  // helpers multi kategori
  function toggleKategoriId(id: string) {
    setMKategoriIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleFileChange(file: File | null) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      setMUploadError("Tipe harus png, jpg, jpeg");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMUploadError("Maksimal 2 MB");
      return;
    }
    setMUploadError(null);
    setMUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const j = await res.json();
      if (!res.ok || !j.success) throw new Error(j.error || "Gagal upload");
      setMGambar(j.url);
    } catch (e: unknown) {
      setMUploadError(e instanceof Error ? e.message : String(e));
    } finally {
      setMUploading(false);
    }
  }

  // menu crud
  async function submitMenu(e: React.FormEvent) {
    e.preventDefault();
    if (mSubmitting || mUploading) return;
    if (mKategoriIds.length === 0) {
      alert("Pilih minimal 1 kategori");
      return;
    }
    setMSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        nama: mNama,
        deskripsi: mDeskripsi,
        deskripsiPanjang: mDeskripsiPanjang || mDeskripsi,
        harga: mHarga,
        gambar: mGambar || null,
        tersedia: mTersedia,
        kategoriIds: mKategoriIds,
      };
      if (mEditing) payload.id = mEditing.id;
      const res = await fetch("/api/admin/menu", {
        method: mEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.success) {
        alert(j.error || "Gagal simpan menu");
        return;
      }
      setMFormOpen(false);
      setMEditing(null);
      setMNama("");
      setMDeskripsi("");
      setMDeskripsiPanjang("");
      setMHarga("");
      setMGambar("");
      setMTersedia(true);
      setMKategoriIds([]);
      fetchMenus();
    } finally {
      setMSubmitting(false);
    }
  }
  function openEditMenu(m: Menu) {
    setMEditing(m);
    setMNama(m.nama);
    setMDeskripsi(m.deskripsi);
    setMDeskripsiPanjang(m.deskripsiPanjang || "");
    setMHarga(String(m.harga));
    setMGambar(m.gambar || "");
    setMTersedia(m.tersedia);
    // support both old kategoriId and new kategoris
    const ids =
      m.kategoris?.map((k) => k.id) ||
      (m.kategoriId ? [m.kategoriId] : m.kategori?.id ? [m.kategori.id] : []);
    setMKategoriIds(ids);
    setMFormOpen(true);
  }
  async function deleteMenu(id: string) {
    if (!confirm("Hapus menu ini?")) return;
    const res = await fetch(`/api/admin/menu?id=${id}`, { method: "DELETE" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.success) alert(j.error || "Gagal hapus");
    else fetchMenus();
  }

  function menuKategoriIds(m: Menu): string[] {
    return (
      m.kategoris?.map((k) => k.id) ||
      (m.kategoriId ? [m.kategoriId] : m.kategori?.id ? [m.kategori.id] : [])
    );
  }

  // Langsung masuk ke kategori pertama agar admin bisa sorting per kategori.
  // "all" tetap tersedia sebagai mode lihat-semua (read-only, tanpa tombol urut).
  const mFilterInit = useRef(false);
  useEffect(() => {
    if (!mFilterInit.current && kategori.length > 0 && mFilterKategori === "all") {
      mFilterInit.current = true;
      const first =
        kategori.find((k) => (k._count?.menus ?? 0) > 0) ?? kategori[0];
      setMFilterKategori(first.id);
    }
  }, [kategori, mFilterKategori]);

  const filteredMenus = menus.filter((m) => {
    const kIds = menuKategoriIds(m);
    if (mFilterKategori === "none") {
      if (kIds.length > 0) return false;
    } else if (mFilterKategori !== "all" && !kIds.includes(mFilterKategori)) {
      return false;
    }
    const kategoriNames =
      m.kategoris?.map((k) => k.nama).join(" ") || m.kategori?.nama || "";
    if (
      mQ &&
      !`${m.nama} ${m.deskripsi} ${kategoriNames}`
        .toLowerCase()
        .includes(mQ.toLowerCase())
    )
      return false;
    return true;
  });

  // Tampilan group per kategori saat mode "Semua" tanpa pencarian.
  // Saat kategori dipilih / pencarian aktif, tampil sebagai daftar datar.
  const isMenuGrouped = mFilterKategori === "all" && !mQ.trim();

  // Sorting hanya aktif saat satu kategori (atau Tanpa kategori) dipilih
  // dan pencarian kosong — yaitu persis daftar yang sedang tampil.
  const isMenuSortable = mFilterKategori !== "all" && !mQ.trim();

  function renderMenuRow(m: Menu, badge: number, sortable: boolean) {
    const ids = filteredMenus.map((x) => x.id);
    const pos = ids.indexOf(m.id);
    const isFirst = pos <= 0;
    const isLast = pos === -1 || pos === ids.length - 1;
    return (
      <div
        key={m.id}
        className="flex items-center gap-2 rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-black/5"
      >
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef6fb] text-xs font-black text-[#0061a6]"
          title={`Urutan ke-${badge} di kategori ini`}
        >
          {badge}
        </div>
        <div
          className={`h-2 w-2 shrink-0 rounded-full ${m.tersedia ? "bg-emerald-500" : "bg-neutral-300"}`}
          title={m.tersedia ? "Tersedia" : "Tidak tersedia"}
        />
        {m.gambar ? (
          <img
            src={m.gambar}
            alt={m.nama}
            className="h-10 w-10 shrink-0 rounded-lg object-cover ring-1 ring-black/5"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400">
            <ImageIcon size={16} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold">{m.nama}</span>
            {!isMenuGrouped && (
              <span className="flex flex-wrap gap-1">
                {(m.kategoris || (m.kategori ? [m.kategori] : [])).map((k) => (
                  <span
                    key={k.id}
                    className="rounded-full bg-[#eef6fb] px-2 py-0.5 text-xs font-semibold text-[#0061a6]"
                  >
                    {k.nama}
                  </span>
                ))}
              </span>
            )}
            <span className="text-xs font-extrabold text-[#0061a6]">
              Rp {m.harga.toLocaleString("id-ID")}
            </span>
            {!m.gambar && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
                Foto belum tersedia
              </span>
            )}
          </div>
          <div className="line-clamp-1 text-xs text-[#6b7280]">
            {m.deskripsi}
          </div>
        </div>
        {sortable && (
          <div
            className="flex shrink-0 items-center gap-1"
            role="group"
            aria-label={`Urutkan ${m.nama}`}
          >
            <button
              onClick={() => moveMenu(m.id, -1)}
              disabled={isFirst}
              title="Naik"
              aria-label={`${m.nama} naik`}
              className="rounded-full bg-neutral-100 p-1.5 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-neutral-100"
            >
              <ChevronUp size={15} />
            </button>
            <button
              onClick={() => moveMenu(m.id, 1)}
              disabled={isLast}
              title="Turun"
              aria-label={`${m.nama} turun`}
              className="rounded-full bg-neutral-100 p-1.5 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-neutral-100"
            >
              <ChevronDown size={15} />
            </button>
          </div>
        )}
        <button
          onClick={() => openEditMenu(m)}
          title="Edit"
          className="shrink-0 rounded-full bg-neutral-100 p-2 hover:bg-neutral-200"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => deleteMenu(m.id)}
          title="Hapus"
          className="shrink-0 rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100"
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  if (!authChecked)
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-[#6b7280]">
        Memeriksa sesi...
      </div>
    );

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0061a6] text-white text-sm font-black">
            S
          </div>
          <div>
            <div className="text-sm font-extrabold leading-none">SKYR Dash</div>
            <div className="text-xs text-[#6b7280]">
              Kelola menu & kategori — atur urutan pakai tombol, klik Simpan
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-neutral-50"
          >
            Lihat Menu
          </Link>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1f2937] px-3 py-1.5 text-xs font-bold text-white hover:bg-black"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex gap-2 rounded-full bg-white p-1 ring-1 ring-black/5 w-fit">
          <button
            onClick={() => setTab("kategori")}
            className={`rounded-full px-4 py-2 text-sm font-bold ${tab === "kategori" ? "bg-[#0061a6] text-white shadow" : "text-[#6b7280] hover:bg-neutral-50"}`}
          >
            Kategori ({kategori.length})
          </button>
          <button
            onClick={() => setTab("menu")}
            className={`rounded-full px-4 py-2 text-sm font-bold ${tab === "menu" ? "bg-[#0061a6] text-white shadow" : "text-[#6b7280] hover:bg-neutral-50"}`}
          >
            Menu ({menus.length})
          </button>
          <button
            onClick={() => setTab("chat")}
            className={`rounded-full px-4 py-2 text-sm font-bold ${tab === "chat" ? "bg-[#0061a6] text-white shadow" : "text-[#6b7280] hover:bg-neutral-50"}`}
          >
            Link Room Chat
          </button>
        </div>

        {tab === "chat" && (
          <div className="mt-6">
            <h2 className="text-base font-extrabold">Link Room Chat — tombol di halaman menu</h2>
            <p className="mt-1 text-xs text-[#6b7280]">
              Link ini dipakai tombol <span className="font-semibold">Masuk ke room chat</span>{" "}
              di halaman menu (untuk request lagu/menyampaikan pesan). Jika link
              dihapus, tombol tidak ditampilkan.
            </p>

            {chatLoading ? (
              <div className="mt-4 h-40 animate-pulse rounded-2xl bg-white ring-1 ring-black/5" />
            ) : (
              <form
                onSubmit={saveChatLink}
                className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5"
              >
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle size={16} className="text-[#0061a6]" />
                  <span className="font-bold">Status:</span>
                  {chatUrl ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                      Aktif — tombol tampil
                    </span>
                  ) : (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-600">
                      Belum ada link — tombol disembunyikan
                    </span>
                  )}
                </div>
                {chatUrl && (
                  <a
                    href={chatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex max-w-full items-center gap-1 break-all text-xs font-semibold text-[#0061a6] hover:underline"
                  >
                    {chatUrl} <ExternalLink size={12} className="shrink-0" />
                  </a>
                )}

                <label className="mt-4 block text-xs font-bold text-neutral-700">
                  Link group chat
                </label>
                <input
                  type="url"
                  required
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:border-[#0061a6] focus:ring-2 focus:ring-[#0061a6]/20"
                />

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {chatUrl && (
                    <button
                      type="button"
                      onClick={deleteChatLink}
                      disabled={chatSubmitting}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      <Trash2 size={16} /> Hapus link
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={chatSubmitting || chatInput.trim() === (chatUrl ?? "")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#0061a6] px-4 py-2 text-sm font-bold text-white hover:bg-[#00548f] disabled:opacity-60"
                  >
                    <Save size={16} />{" "}
                    {chatSubmitting ? "Menyimpan..." : chatUrl ? "Simpan perubahan" : "Tambah link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {tab === "kategori" && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-extrabold">
                Kategori — atur urutan tampil
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setKEditing(null);
                    setKNama("");
                    setKDeskripsi("");
                    setKFormOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0061a6] px-4 py-2 text-sm font-bold text-white hover:bg-[#00548f]"
                >
                  <Plus size={16} /> Tambah Kategori
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-[#6b7280]">
              No. 1 tampil paling awal di kategori bar. Pakai tombol{" "}
              <ChevronUp size={12} className="inline" /> untuk naik dan{" "}
              <ChevronDown size={12} className="inline" /> untuk turun, lalu
              klik <span className="font-semibold">Simpan urutan</span>.
              Kategori tidak bisa dihapus jika masih dipakai menu.
            </p>
            {kategoriChanged && (
              <div className="sticky top-[57px] z-10 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <ArrowUpDown size={14} /> Urutan berubah — belum disimpan
                </span>
                <span className="flex gap-2">
                  <button
                    onClick={resetKategoriOrder}
                    disabled={kSavingOrder}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-60"
                  >
                    <RotateCcw size={14} /> Batalkan
                  </button>
                  <button
                    onClick={saveOrder}
                    disabled={kSavingOrder}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Save size={14} />{" "}
                    {kSavingOrder ? "Menyimpan..." : "Simpan urutan"}
                  </button>
                </span>
              </div>
            )}

            {kLoading ? (
              <div className="mt-4 grid gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl bg-white ring-1 ring-black/5"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-2">
                {kategori.map((k, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === kategori.length - 1;
                  return (
                    <div
                      key={k.id}
                      className="flex items-center gap-2 rounded-2xl bg-white px-3 py-3 shadow-sm ring-1 ring-black/5 sm:gap-3"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef6fb] text-xs font-black text-[#0061a6]"
                        title={`Posisi ${idx + 1} dari ${kategori.length}`}
                      >
                        {idx + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold leading-tight">
                          {k.nama}
                        </div>
                        <div className="text-xs text-[#6b7280]">
                          {k.slug} • {k._count?.menus ?? 0} menu{" "}
                          {k.deskripsi ? `• ${k.deskripsi}` : ""}
                        </div>
                      </div>
                      <div
                        className="flex shrink-0 items-center gap-1"
                        role="group"
                        aria-label={`Urutkan ${k.nama}`}
                      >
                        <button
                          onClick={() => moveKategori(k.id, -1)}
                          disabled={isFirst}
                          title="Naik"
                          aria-label={`${k.nama} naik`}
                          className="rounded-full bg-neutral-100 p-2 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-neutral-100"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => moveKategori(k.id, 1)}
                          disabled={isLast}
                          title="Turun"
                          aria-label={`${k.nama} turun`}
                          className="rounded-full bg-neutral-100 p-2 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-neutral-100"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                      <button
                        onClick={() => openEditKategori(k)}
                        title="Edit"
                        className="shrink-0 rounded-full bg-neutral-100 p-2 hover:bg-neutral-200"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => deleteKategori(k.id)}
                        title="Hapus"
                        className="shrink-0 rounded-full bg-red-50 p-2 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
                {kategori.length === 0 && (
                  <div className="rounded-2xl bg-white px-6 py-12 text-center text-sm text-[#6b7280]">
                    Belum ada kategori.
                  </div>
                )}
              </div>
            )}

            {kFormOpen && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
                <form
                  onSubmit={submitKategori}
                  className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold">
                      {kEditing ? "Edit Kategori" : "Tambah Kategori"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setKFormOpen(false)}
                      className="rounded-full bg-neutral-100 p-1.5"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <label className="mt-4 block">
                    <span className="text-xs font-semibold">Nama</span>
                    <input
                      value={kNama}
                      onChange={(e) => setKNama(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-[#0061a6]/10"
                      placeholder="Signature SKYR"
                    />
                  </label>
                  <label className="mt-3 block">
                    <span className="text-xs font-semibold">
                      Deskripsi (opsional)
                    </span>
                    <input
                      value={kDeskripsi}
                      onChange={(e) => setKDeskripsi(e.target.value)}
                      className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-[#0061a6]/10"
                      placeholder="Kategori..."
                    />
                  </label>
                  <p className="mt-2 text-xs text-[#9ca3af]">
                    Slug otomatis dari nama (ex: Classic/Basic Coffee →
                    classic-basic-coffee).
                  </p>
                  <button
                    type="submit"
                    disabled={kSubmitting}
                    className={`mt-4 w-full rounded-full py-3 text-sm font-bold text-white transition ${kSubmitting ? "bg-neutral-400 cursor-not-allowed" : "bg-[#0061a6] hover:bg-[#00548f]"}`}
                  >
                    {kSubmitting
                      ? "Menyimpan..."
                      : kEditing
                        ? "Simpan"
                        : "Tambah"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {tab === "menu" && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-extrabold">
                Menu — atur urutan tampil
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMEditing(null);
                    setMNama("");
                    setMDeskripsi("");
                    setMDeskripsiPanjang("");
                    setMHarga("");
                    setMGambar("");
                    setMTersedia(true);
                    setMKategoriIds([]);
                    setMUploadError(null);
                    setMFormOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0061a6] px-4 py-2 text-sm font-bold text-white hover:bg-[#00548f]"
                >
                  <Plus size={16} /> Tambah Menu
                </button>
              </div>
            </div>
            <p className="mt-1 text-xs text-[#6b7280]">
              Pilih kategori di atas, lalu pakai tombol{" "}
              <ChevronUp size={12} className="inline" /> untuk naik dan{" "}
              <ChevronDown size={12} className="inline" /> untuk turun. No. 1
              tampil paling atas di aplikasi pelanggan. Klik{" "}
              <span className="font-semibold">Simpan urutan menu</span> jika
              sudah pas.
            </p>
            {menuChanged && (
              <div className="sticky top-[57px] z-10 mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <ArrowUpDown size={14} /> Urutan menu berubah — belum disimpan
                </span>
                <span className="flex gap-2">
                  <button
                    onClick={resetMenuOrder}
                    disabled={mSavingOrder}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-white px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-50 disabled:opacity-60"
                  >
                    <RotateCcw size={14} /> Batalkan
                  </button>
                  <button
                    onClick={saveMenuOrder}
                    disabled={mSavingOrder}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Save size={14} />{" "}
                    {mSavingOrder ? "Menyimpan..." : "Simpan urutan menu"}
                  </button>
                </span>
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                />
                <input
                  value={mQ}
                  onChange={(e) => setMQ(e.target.value)}
                  placeholder="Cari nama/deskripsi"
                  className="rounded-full border bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-4 focus:ring-[#0061a6]/10"
                />
              </div>
              <select
                value={mFilterKategori}
                onChange={(e) => setMFilterKategori(e.target.value)}
                className="rounded-full border bg-white px-3 py-2 text-sm"
                aria-label="Pilih kategori untuk atur urutan"
              >
                <option value="all">Semua kategori (lihat saja)</option>
                {kategori.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
                <option value="none">Tanpa kategori</option>
              </select>
            </div>
            {!isMenuSortable && !mLoading && filteredMenus.length > 0 && (
              <p className="mt-2 text-xs text-[#9ca3af]">
                {mFilterKategori === "all"
                  ? "Mode lihat semua — pilih salah satu kategori di atas untuk mengatur urutan."
                  : "Kosongkan pencarian untuk mengatur urutan."}
              </p>
            )}

            {mLoading ? (
              <div className="mt-4 grid gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-2xl bg-white ring-1 ring-black/5"
                  />
                ))}
              </div>
            ) : filteredMenus.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-white px-6 py-12 text-center text-sm text-[#6b7280]">
                Tidak ada menu.
              </div>
            ) : isMenuGrouped ? (
              <div className="mt-4 grid gap-5">
                {kategori.map((k) => {
                  const items = filteredMenus.filter((m) =>
                    menuKategoriIds(m).includes(k.id),
                  );
                  if (items.length === 0) return null;
                  return (
                    <section key={k.id} aria-label={`Kategori ${k.nama}`}>
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-sm font-extrabold">{k.nama}</h3>
                        <span className="rounded-full bg-[#eef6fb] px-2 py-0.5 text-xs font-bold text-[#0061a6]">
                          {items.length} menu
                        </span>
                      </div>
                      <div className="grid gap-2">
                        {items.map((m, i) => renderMenuRow(m, i + 1, false))}
                      </div>
                    </section>
                  );
                })}
                {(() => {
                  const ungrouped = filteredMenus.filter(
                    (m) => menuKategoriIds(m).length === 0,
                  );
                  if (ungrouped.length === 0) return null;
                  return (
                    <section aria-label="Tanpa kategori">
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="text-sm font-extrabold">
                          Tanpa kategori
                        </h3>
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-neutral-600">
                          {ungrouped.length} menu
                        </span>
                      </div>
                      <div className="grid gap-2">
                        {ungrouped.map((m, i) => renderMenuRow(m, i + 1, false))}
                      </div>
                    </section>
                  );
                })()}
              </div>
            ) : (
              <div className="mt-4 grid gap-2">
                {filteredMenus.map((m, i) =>
                  renderMenuRow(m, i + 1, isMenuSortable),
                )}
              </div>
            )}

            {mFormOpen && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
                <form
                  onSubmit={submitMenu}
                  className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold">
                      {mEditing ? "Edit Menu" : "Tambah Menu"}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setMFormOpen(false)}
                      className="rounded-full bg-neutral-100 p-1.5"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <label className="mt-4 block">
                    <span className="text-xs font-semibold">Nama *</span>
                    <input
                      value={mNama}
                      onChange={(e) => setMNama(e.target.value)}
                      required
                      className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-[#0061a6]/10"
                    />
                  </label>
                  <div className="mt-3">
                    <span className="text-xs font-semibold">
                      Kategori * (bisa multiple)
                    </span>
                    <div className="mt-1 grid grid-cols-2 gap-2 rounded-xl border bg-white p-3">
                      {kategori.length === 0 ? (
                        <span className="col-span-2 text-xs text-[#9ca3af]">
                          Belum ada kategori — buat dulu di tab Kategori.
                        </span>
                      ) : (
                        kategori.map((k) => (
                          <label
                            key={k.id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={mKategoriIds.includes(k.id)}
                              onChange={() => toggleKategoriId(k.id)}
                              className="h-4 w-4 rounded border-black/20 text-[#0061a6]"
                            />
                            <span className="text-sm">{k.nama}</span>
                          </label>
                        ))
                      )}
                    </div>
                    <span className="mt-1 block text-xs text-[#9ca3af]">
                      {mKategoriIds.length} terpilih
                    </span>
                  </div>
                  <label className="mt-3 block">
                    <span className="text-xs font-semibold">
                      Deskripsi singkat
                    </span>
                    <input
                      value={mDeskripsi}
                      onChange={(e) => setMDeskripsi(e.target.value)}
                      className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-[#0061a6]/10"
                      placeholder="ex: Kopi susu creamy"
                    />
                  </label>
                  <label className="mt-3 block">
                    <span className="text-xs font-semibold">
                      Deskripsi panjang
                    </span>
                    <textarea
                      value={mDeskripsiPanjang}
                      onChange={(e) => setMDeskripsiPanjang(e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-[#0061a6]/10"
                    />
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-semibold">Harga *</span>
                      <input
                        value={mHarga}
                        onChange={(e) => setMHarga(e.target.value)}
                        required
                        placeholder="35000"
                        className="mt-1 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-4 focus:ring-[#0061a6]/10"
                      />
                    </label>
                    <label className="flex items-center gap-2 pt-6">
                      <input
                        type="checkbox"
                        checked={mTersedia}
                        onChange={(e) => setMTersedia(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <span className="text-xs font-semibold">Tersedia</span>
                    </label>
                  </div>
                  <div className="mt-3">
                    <span className="text-xs font-semibold">
                      Gambar (png/jpg/jpeg max 2MB)
                    </span>
                    <div className="mt-1 flex items-center gap-3">
                      {mGambar ? (
                        <img
                          src={mGambar}
                          alt="preview"
                          className="h-16 w-16 rounded-xl object-cover ring-1 ring-black/5"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                          <ImageIcon size={20} />
                        </div>
                      )}
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-semibold hover:bg-neutral-50">
                        <Upload size={16} />
                        {mUploading ? "Mengunggah..." : "Upload file"}
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                          className="hidden"
                          onChange={(e) =>
                            handleFileChange(e.target.files?.[0] || null)
                          }
                          disabled={mUploading}
                        />
                      </label>
                      {mGambar && (
                        <button
                          type="button"
                          onClick={() => setMGambar("")}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    {mUploadError && (
                      <div className="mt-1 text-xs text-red-600">
                        {mUploadError}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={mSubmitting || mUploading}
                    className={`mt-4 w-full rounded-full py-3 text-sm font-bold text-white transition ${mSubmitting || mUploading ? "bg-neutral-400 cursor-not-allowed" : "bg-[#0061a6] hover:bg-[#00548f]"}`}
                  >
                    {mSubmitting
                      ? "Menyimpan..."
                      : mEditing
                        ? "Simpan"
                        : "Tambah"}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
