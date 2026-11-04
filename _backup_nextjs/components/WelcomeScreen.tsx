"use client";

import { useEffect, useCallback } from "react";
import MascotLottie from "@/components/MascotLottie";

type Props = {
  onEnter: () => void;
  isExiting: boolean;
};

export default function WelcomeScreen({ onEnter, isExiting }: Props) {
  const handleEnter = useCallback(() => {
    if (isExiting) return;
    onEnter();
  }, [isExiting, onEnter]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleEnter]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;
    const prevBodyOverscroll = body.style.overscrollBehavior as string;
    const prevHtmlOverscroll = html.style.overscrollBehavior as string;

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    const prevent = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest && target.closest("button")) return;
      e.preventDefault();
    };
    document.addEventListener("touchmove", prevent, { passive: false });

    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.overscrollBehavior = prevHtmlOverscroll;
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevBodyOverscroll;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      document.removeEventListener("touchmove", prevent);
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <div
      id="skyr-welcome"
      data-exiting={isExiting ? "1" : "0"}
      className={`fixed inset-0 z-[9999] flex h-[100dvh] max-h-[100dvh] w-screen flex-col items-center justify-center overflow-hidden bg-[#0061a6] px-6 py-6 text-white overscroll-none touch-none ${
        isExiting ? "welcome-exit" : "welcome-enter"
      }`}
      style={
        {
          height: "100dvh",
          minHeight: "-webkit-fill-available",
        } as React.CSSProperties
      }
    >
      {/* Background swirl — slow drift, lebih halus */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        {/* soft glow di belakang judul */}
        <div className="animate-welcome-glow absolute left-1/2 top-[38%] h-[420px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.07] blur-[70px]" />
        <div className="animate-welcome-glow absolute left-1/2 top-[42%] h-[360px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.05] blur-[60px] [animation-delay:1.2s]" />
        <svg
          className="animate-welcome-bg absolute inset-0 h-full w-full"
          viewBox="0 0 400 800"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M -20 80 C 60 40, 140 120, 220 70 S 360 10, 420 90"
              strokeOpacity="0.14"
              strokeWidth="1.4"
            />
            <path
              d="M -20 140 C 70 110, 130 200, 240 160 S 360 90, 420 150"
              strokeOpacity="0.10"
              strokeWidth="1.2"
            />
            <path
              d="M -20 200 C 50 170, 160 260, 260 230 S 380 170, 420 220"
              strokeOpacity="0.12"
              strokeWidth="1.3"
            />
            <path
              d="M -20 300 C 80 240, 180 340, 280 300 S 380 260, 420 310"
              strokeOpacity="0.11"
              strokeWidth="1.1"
            />
            <path
              d="M -20 400 C 60 360, 150 460, 250 420 S 360 370, 420 420"
              strokeOpacity="0.09"
              strokeWidth="1.2"
            />
            <path
              d="M -20 520 C 90 470, 170 560, 270 530 S 370 490, 420 540"
              strokeOpacity="0.10"
              strokeWidth="1.0"
            />
            <path
              d="M -20 640 C 70 600, 160 700, 260 670 S 370 620, 420 680"
              strokeOpacity="0.11"
              strokeWidth="1.3"
            />
            <path
              d="M 40 0 C 90 80, 70 220, 140 320 S 180 520, 240 620 S 320 750, 360 800"
              strokeOpacity="0.07"
              strokeWidth="1.5"
            />
            <path
              d="M 160 0 C 180 100, 220 240, 180 360 S 260 580, 300 700"
              strokeOpacity="0.06"
              strokeWidth="1.2"
            />
            <path
              d="M 280 0 C 300 90, 320 200, 300 340 S 340 560, 380 680"
              strokeOpacity="0.07"
              strokeWidth="1.1"
            />
          </g>
          <g fill="none" stroke="white" strokeOpacity="0.04" strokeWidth="8">
            <path d="M -20 110 C 80 70, 180 140, 260 110 S 380 60, 420 120" />
            <path d="M -20 360 C 100 320, 200 420, 320 380 S 420 360, 420 400" />
            <path d="M -20 580 C 80 540, 180 640, 300 610" />
          </g>
        </svg>
      </div>

      <div className="relative z-10 flex w-full max-w-[360px] flex-col items-center text-center">
        <div className="animate-welcome-title will-change-transform">
          <h1 className="bg-gradient-to-b from-white to-white/90 bg-clip-text text-[64px] font-black tracking-[0.18em] text-transparent drop-shadow-[0_2px_12px_rgba(255,255,255,0.18)] sm:text-[82px] lg:text-[96px]">
            SKYR
          </h1>
          <div
            className="mx-auto mt-2 h-px bg-white/30"
            style={{ width: "68%" }}
          />
        </div>
        <p className="animate-welcome-sub mt-3 text-xs font-semibold tracking-[0.22em] text-white/75 sm:text-sm">
          HOME OF THE MONSTER
        </p>

        <div
          className="animate-welcome-sub relative mt-8 flex flex-col items-center"
          style={{ animationDelay: "0.85s" } as React.CSSProperties}
        >
          <div className="relative z-0 -mb-2 sm:-mb-4">
            <MascotLottie
              priority
              className="w-[160px] drop-shadow-[0_8px_16px_rgba(0,0,0,0.24)] sm:w-[220px]"
            />
          </div>
          <button
            type="button"
            onClick={handleEnter}
            aria-label="Lihat Menu"
            className="animate-welcome-btn group relative z-10 flex min-h-[54px] min-w-[210px] cursor-pointer select-none items-center justify-center overflow-hidden rounded-full bg-white px-10 py-3.5 text-sm font-black tracking-[0.14em] text-[#0061a6] shadow-[0_8px_0_rgba(0,0,0,0.18),0_12px_24px_rgba(0,0,0,0.15)] transition-[transform,box-shadow] duration-300 will-change-transform hover:scale-[1.02] hover:shadow-[0_10px_0_rgba(0,0,0,0.18),0_16px_32px_rgba(0,0,0,0.18)] active:translate-y-[2px] active:shadow-[0_4px_0_rgba(0,0,0,0.18)] sm:min-w-[230px] sm:px-12 sm:py-4 sm:text-[15px]"
            style={
              {
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
              } as React.CSSProperties
            }
          >
            <span
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#0061a6]/10 to-transparent transition-transform duration-[1.2s] ease-out group-hover:translate-x-full"
              aria-hidden
            />
            <span className="relative">LIHAT MENU</span>
            <span className="relative ml-2 text-base leading-none transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
