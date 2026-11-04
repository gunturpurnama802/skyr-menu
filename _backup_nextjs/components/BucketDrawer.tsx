"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { formatPrice, type MenuItem } from "@/data/menu";

export type BucketItem = {
  item: MenuItem;
  qty: number;
  note: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  items: BucketItem[];
  onInc: (id: string | number) => void;
  onDec: (id: string | number) => void;
  onRemove: (id: string | number) => void;
  onNoteChange: (id: string | number, note: string) => void;
  onClear: () => void;
};

export default function BucketDrawer({
  open,
  onClose,
  items,
  onInc,
  onDec,
  onRemove,
  onNoteChange,
  onClear,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const totalQty = items.reduce((s, b) => s + b.qty, 0);
  const totalPrice = items.reduce((s, b) => s + b.item.price * b.qty, 0);

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Catatan"
    >
      <button
        aria-label="Tutup catatan"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="relative flex h-dvh w-full max-w-[420px] flex-col bg-[#f8fafc] shadow-2xl">
        {/* Header — tetap SKYR blue */}
        <div className="flex items-center justify-between bg-[#0061a6] px-5 py-4 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-none">Catatan</h2>
              <p className="text-xs text-white/70">{totalQty} item</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close catatan"
            className="rounded-full bg-white/15 p-2 hover:bg-white/25"
          >
            <X size={18} />
          </button>
        </div>

        {/* Kertas — background garis + monster-notes lucu */}
        <div
          className="flex-1 overflow-y-auto px-4 py-5 sm:px-5"
          style={{
            backgroundColor: "#fffef5",
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 31px, #e7e5e4 31px, #e7e5e4 32px), linear-gradient(to right, #fca5a5 0, #fca5a5 2px, transparent 2px)",
            backgroundPosition: "0 0, 44px 0",
            backgroundSize: "100% 32px, 100% 100%",
          }}
        >
          {/* monster-notes di pojok atas kertas */}
          <div className="pointer-events-none mb-3 flex justify-center">
            <div className="relative">
              <Image
                src="/monster-notes.webp"
                alt="Monster notes"
                width={140}
                height={90}
                className="h-auto w-[140px] object-contain drop-shadow-sm"
                priority
              />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#0061a6] shadow ring-1 ring-black/5">
                MONSTER NOTES
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-2xl bg-white/90 px-6 py-8 shadow-sm ring-1 ring-black/5 backdrop-blur">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef6fb] text-[#0061a6]">
                  <ShoppingBag size={20} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-[#1f2937]">
                  Kertas masih kosong
                </h3>
                <p className="mt-1 max-w-[260px] text-sm leading-5 text-[#6b7280]">
                  Tap{" "}
                  <span className="font-semibold text-[#0061a6]">Catat</span>{" "}
                  untuk menambahkan menu ke catatan.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {items.map(({ item, qty, note }) => (
                <div
                  key={item.id}
                  className="relative rounded-xl bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] ring-1 ring-black/5"
                >
                  {/* selotip lucu di atas kertas */}
                  <div className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 rotate-[-2deg] rounded-sm bg-amber-200/70 shadow-sm ring-1 ring-amber-300/30" />
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold leading-tight text-[#1f2937]">
                        {item.name}
                      </h3>
                      <p className="text-xs text-[#6b7280]">
                        {formatPrice(item.price)} / pcs
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      aria-label={`Hapus ${item.name}`}
                      className="shrink-0 rounded-full bg-neutral-100 p-1.5 text-[#6b7280] hover:bg-neutral-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-1 rounded-full bg-[#f1f5f9] p-1">
                      <button
                        onClick={() => onDec(item.id)}
                        aria-label={`Kurangi ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 hover:bg-neutral-50"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-7 text-center text-sm font-bold text-[#1f2937]">
                        {qty}
                      </span>
                      <button
                        onClick={() => onInc(item.id)}
                        aria-label={`Catat ${item.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0061a6] text-white hover:bg-[#00548f]"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-extrabold text-[#0061a6]">
                      {formatPrice(item.price * qty)}
                    </span>
                  </div>

                  <label className="mt-3 block">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#6b7280]">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />{" "}
                      Catatan
                    </span>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => onNoteChange(item.id, e.target.value)}
                      placeholder="Contoh: tidak pedas, es sedikit..."
                      className="mt-1 w-full rounded-lg border border-amber-200/50 bg-amber-50/50 px-3 py-2.5 text-sm text-[#1f2937] placeholder:text-[#9ca3af] outline-none focus:border-[#0061a6]/30 focus:bg-white focus:ring-4 focus:ring-[#0061a6]/10"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(transparent, transparent 27px, #fde68a 27px, #fde68a 28px)",
                        backgroundSize: "100% 28px",
                      }}
                    />
                  </label>
                </div>
              ))}
              {/* monster kecil di bawah kertas */}
              <div className="flex justify-center pt-2 opacity-80">
                <Image
                  src="/monster-notes.webp"
                  alt=""
                  width={90}
                  height={60}
                  className="h-auto w-[90px] object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-black/5 bg-white px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6b7280]">Total ({totalQty} item)</span>
              <span className="text-base font-extrabold text-[#0061a6]">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#9ca3af]">
              Harga belum termasuk PPN 10% • konfirmasi saat pemesanan.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={onClear}
                className="flex-1 rounded-full border border-black/10 bg-white py-3 text-sm font-semibold text-[#1f2937] hover:bg-neutral-50"
              >
                Kosongkan
              </button>
              <button
                onClick={onClose}
                className="flex-1 rounded-full bg-[#0061a6] py-3 text-sm font-bold text-white hover:bg-[#00548f]"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
