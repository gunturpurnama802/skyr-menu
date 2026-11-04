"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Music2, Pause } from "lucide-react";

const TRACKS = ["/music/fh.mp3", "/music/jb.mp3"];

export default function MusicPlayer() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/skyr-dash");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);

  const tryPlay = useCallback(async () => {
    const a = audioRef.current;
    if (!a || !a.src) return;
    try {
      await a.play();
      setIsPlaying(true);
      setNeedsInteraction(false);
    } catch {
      setIsPlaying(false);
      setNeedsInteraction(true);
    }
  }, []);

  // Di admin komponen tidak dirender (audio ikut unmount → musik berhenti).
  // Saat kembali ke menu, audio mount lagi dan effect ini memutar ulang.
  useEffect(() => {
    if (isAdmin) return;
    const a = audioRef.current;
    if (!a) return;
    // Pilih track random di client (bukan saat render) — hindari hydration mismatch
    if (!a.src) a.src = TRACKS[Math.floor(Math.random() * TRACKS.length)];
    a.volume = 0.55;
    // autoplay saat welcome page tampil; kalau diblok browser, tunggu interaksi pertama
    tryPlay();

    const onFirstInteract = () => {
      if (a.paused) tryPlay();
    };
    window.addEventListener("click", onFirstInteract, { once: true });
    window.addEventListener("touchend", onFirstInteract, { once: true });
    window.addEventListener("keydown", onFirstInteract, { once: true });

    return () => {
      window.removeEventListener("click", onFirstInteract);
      window.removeEventListener("touchend", onFirstInteract);
      window.removeEventListener("keydown", onFirstInteract);
    };
  }, [tryPlay, isAdmin]);

  const toggle = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      try {
        await a.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      a.pause();
      setIsPlaying(false);
    }
  }, []);

  if (isAdmin) return null;

  return (
    <>
      <audio ref={audioRef} preload="auto" loop playsInline />
      <button
        type="button"
        onClick={toggle}
        aria-label={isPlaying ? "Pause music" : "Play music"}
        title={isPlaying ? "Pause" : "Play music"}
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] ring-1 ring-black/5 transition hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
      >
        <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-[#0061a6] text-white sm:h-12 sm:w-12 ${isPlaying ? "animate-spin [animation-duration:3s]" : ""}`} style={{ animationPlayState: isPlaying ? "running" : "paused" as React.CSSProperties["animationPlayState"] }}>
          <Music2 size={18} className="sm:hidden" />
          {/* desktop icon pakai conditional pause/play */}
          <span className="hidden sm:inline-flex">
            {isPlaying ? <Pause size={20} /> : <Music2 size={20} />}
          </span>
        </span>
        {/* ping saat butuh interaksi */}
        {needsInteraction && !isPlaying && (
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
          </span>
        )}
      </button>
    </>
  );
}
