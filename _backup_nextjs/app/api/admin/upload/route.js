import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import sharp from "sharp";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_EXTS = [".jpg", ".jpeg", ".png"];

export async function POST(request) {
  const ok = await isAuthenticated();
  if (!ok) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ success: false, error: "File wajib" }, { status: 400 });
    }

    const mime = file.type;
    const ext = path.extname(file.name || "").toLowerCase();

    if (!ALLOWED_TYPES.includes(mime) && !ALLOWED_EXTS.includes(ext)) {
      return NextResponse.json({ success: false, error: "Tipe file harus png, jpg, jpeg" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: "Ukuran maksimal 2 MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Kompres: resize max 800px, format webp quality 75 untuk ringan; webp support transparansi.
    const compressed = await sharp(buffer)
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();

    // Prioritas: jika BLOB_READ_WRITE_TOKEN ada, pakai Vercel Blob (jangan base64) — berlaku lokal & Vercel
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
        const blob = await put(`menu/${filename}`, compressed, {
          access: "public",
          contentType: "image/webp",
        });
        return NextResponse.json({ success: true, url: blob.url, size: compressed.length });
      } catch (e) {
        console.error("[upload] Blob failed", e);
        return NextResponse.json({ success: false, error: `Gagal upload ke Blob: ${e.message}` }, { status: 500 });
      }
    }

    const isVercel = !!process.env.VERCEL;
    if (isVercel) {
      // Di Vercel tanpa token tidak bisa tulis public (read-only) dan base64 tidak dipakai lagi
      return NextResponse.json(
        { success: false, error: "BLOB_READ_WRITE_TOKEN belum di-set di Vercel Env. Tambahkan di Vercel Dashboard → Settings → Environment Variables." },
        { status: 500 }
      );
    }

    // Local tanpa Blob: tulis ke public/uploads/menu
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
    const dir = path.join(process.cwd(), "public", "uploads", "menu");
    await mkdir(dir, { recursive: true });
    const filepath = path.join(dir, filename);
    await writeFile(filepath, compressed);

    const url = `/uploads/menu/${filename}`;
    return NextResponse.json({ success: true, url, size: compressed.length });
  } catch (e) {
    console.error("[upload]", e);
    return NextResponse.json({ success: false, error: e.message || "Gagal upload" }, { status: 500 });
  }
}
