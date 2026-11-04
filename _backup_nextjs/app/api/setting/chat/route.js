import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/setting/chat
 * Public — link group chat untuk tombol "Masuk ke room chat" di menu list.
 * Response: { success:true, url: string | null }
 */
export async function GET() {
  try {
    const s = await prisma.setting.findUnique({ where: { key: "chat_link" } });
    return NextResponse.json({ success: true, url: s?.value || null });
  } catch (e) {
    console.error("[GET /api/setting/chat]", e);
    return NextResponse.json({ success: false, url: null, error: "Gagal mengambil link chat" }, { status: 500 });
  }
}
