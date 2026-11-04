"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// Maskot melambai (Lottie). Selama animasi dimuat — atau jika gagal —
// tampil gambar statis /mascot.webp di posisi yang sama.
export default function MascotLottie({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let anim: { destroy: () => void } | null = null;
    let cancelled = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (cancelled || !containerRef.current) return;
      const a = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: !reduceMotion,
        autoplay: !reduceMotion,
        path: "/waving_mascot_lottie.json",
        rendererSettings: { preserveAspectRatio: "xMidYMax meet" },
      });
      a.addEventListener("DOMLoaded", () => {
        if (reduceMotion) a.goToAndStop(0, true);
        if (!cancelled) setReady(true);
      });
      anim = a;
    });

    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, []);

  return (
    <div className={`relative aspect-[1852/1121] ${className}`} aria-hidden>
      {!ready && (
        <Image
          src="/mascot.webp"
          alt=""
          fill
          sizes="240px"
          priority={priority}
          className="object-contain object-bottom"
        />
      )}
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
