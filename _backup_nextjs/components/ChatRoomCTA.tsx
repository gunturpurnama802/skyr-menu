import MascotLottie from "@/components/MascotLottie";
import { MessageCircle } from "lucide-react";

// Kartu ajakan masuk room chat (request lagu / kirim pesan).
// Link diatur admin di /skyr-dash → tab "Link Room Chat".
export default function ChatRoomCTA({ href }: { href: string }) {
  return (
    <div className="relative mb-5 overflow-hidden rounded-[24px] bg-[#FFD23F] shadow-[0_10px_0_rgba(0,0,0,0.12),0_16px_32px_rgba(0,0,0,0.18)] ring-2 ring-white/60">
      {/* Ornamen abstrak */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 400 140"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <path d="M-20 110 C 40 60, 90 150, 160 100 S 250 40, 300 90" fill="none" stroke="#FFB300" strokeWidth="26" strokeLinecap="round" opacity="0.55" />
        <circle cx="360" cy="20" r="46" fill="#FFE680" />
        <circle cx="300" cy="150" r="54" fill="#FFB300" opacity="0.45" />
        <path d="M-10 18 C 30 -6, 60 40, 100 14 S 160 -4, 190 22" fill="none" stroke="#0061a6" strokeWidth="3" strokeLinecap="round" opacity="0.28" />
        <path d="M200 128 q 10 -14 20 0 t 20 0 t 20 0" fill="none" stroke="#0061a6" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
        <g fill="#ffffff" opacity="0.85">
          <circle cx="232" cy="26" r="4" />
          <circle cx="250" cy="44" r="2.5" />
        </g>
        <path d="M268 20 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#ffffff" opacity="0.9" />
        <path d="M150 20 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#0061a6" opacity="0.35" />
      </svg>

      <div className="relative flex min-h-[132px] items-center gap-3 py-4 pl-4 pr-[132px] sm:min-h-[148px] sm:pl-6 sm:pr-[200px]">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0061a6]/70">
            Monster Room
          </p>
          <h3 className="mt-0.5 text-base font-black leading-tight text-[#0b2a4a] sm:text-lg">
            Ingin request lagu/menyampaikan pesan?
          </h3>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#0061a6] px-4 py-2.5 text-sm font-bold text-white shadow-[0_4px_0_#003f6e] transition-[transform,box-shadow] hover:bg-[#00548f] active:translate-y-[2px] active:shadow-[0_2px_0_#003f6e] sm:px-5"
          >
            <MessageCircle size={16} className="shrink-0" />
            Masuk ke room chat
          </a>
        </div>
      </div>

      {/* Maskot mengintip dari bawah kanan */}
      <div className="pointer-events-none absolute -bottom-1 right-1 w-[128px] sm:right-3 sm:w-[190px]">
        <MascotLottie className="w-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.18)]" />
      </div>
    </div>
  );
}
