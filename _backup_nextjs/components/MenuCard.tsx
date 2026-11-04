"use client";

import { useState, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { Plus, Minus, ImageIcon } from "lucide-react";
import { formatPrice, type MenuItem } from "@/data/menu";

type Props = {
  item: MenuItem;
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
};

export default function MenuCard({ item, qty, onAdd, onInc, onDec }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const image = item.image?.trim() || null;
  const nameRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  // fallback panjang karakter agar langsung running tanpa tunggu measure
  const [isOverflowing, setIsOverflowing] = useState(() => item.name.length > 16);

  useLayoutEffect(() => {
    const el = nameRef.current;
    const txt = textRef.current;
    if (!el || !txt) return;
    const check = () => {
      const overflow = txt.scrollWidth > el.clientWidth + 4 || item.name.length > 18;
      setIsOverflowing(overflow);
    };
    // delay 1 frame agar layout card sudah final
    const raf = requestAnimationFrame(check);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [item.name]);

  return (
    <article className="flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.04]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        {!image ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100 text-neutral-400">
            <ImageIcon size={28} className="text-neutral-300" />
            <span className="text-[11px] font-medium">Foto belum tersedia</span>
          </div>
        ) : (
          <>
            {!loaded && !error && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-neutral-200 via-neutral-100 to-neutral-200">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon size={28} className="text-neutral-300" />
                </div>
              </div>
            )}
            {error ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-neutral-100 text-neutral-400">
                <ImageIcon size={24} />
                <span className="text-[11px]">Foto belum tersedia</span>
              </div>
            ) : (
              <Image
                src={image}
                alt={item.name}
                fill
                unoptimized={image.startsWith("data:")}
                className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
              />
            )}
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3.5 py-3.5">
        <div
          ref={nameRef}
          className="w-full overflow-hidden whitespace-nowrap text-[13px] font-bold leading-tight text-[#1f2937] sm:text-[14px]"
          title={item.name}
        >
          {isOverflowing ? (
            <div
              className="flex w-max animate-[menuMarquee_10s_linear_infinite]"
              style={{ animationDuration: `${Math.max(6, item.name.length * 0.35)}s` } as React.CSSProperties}
            >
              <span ref={textRef} className="pr-10">
                {item.name}
              </span>
              <span aria-hidden className="pr-10">
                {item.name}
              </span>
            </div>
          ) : (
            <span ref={textRef} className="block truncate">
              {item.name}
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 min-h-[36px] text-[12px] leading-4 text-[#6b7280] sm:text-[13px]">
          {item.description}
        </p>
        <p className="mt-2 text-[13px] font-extrabold text-[#0061a6] sm:text-[14px]">{formatPrice(item.price)}</p>

        <div className="mt-3">
          {qty === 0 ? (
            <button
              type="button"
              onClick={onAdd}
              aria-label={`Catat ${item.name}`}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#0061a6] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#00548f] active:scale-[0.97]"
            >
              <Plus size={16} />
              Catat
            </button>
          ) : (
            <div className="inline-flex w-full items-center justify-between gap-1 rounded-full bg-[#0061a6] p-1 text-white">
              <button
                type="button"
                onClick={onDec}
                aria-label={`Kurangi ${item.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 active:scale-95"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-6 text-center text-sm font-bold">{qty}</span>
              <button
                type="button"
                onClick={onInc}
                aria-label={`Tambah ${item.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0061a6] hover:bg-white/90 active:scale-95"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
