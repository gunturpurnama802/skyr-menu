import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/menu — public, dipakai halaman menu list.
 * Mengembalikan semua menu yang tersedia (urut sesuai admin) + daftar kategori.
 *
 * Response: { success:true, data: MenuItem[], kategori: MenuKategori[] }
 */
export async function GET() {
  try {
    const [menus, kategori] = await Promise.all([
      prisma.menu.findMany({
        where: { tersedia: true },
        orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
        include: {
          kategoris: { select: { id: true, nama: true, slug: true } },
        },
      }),
      prisma.menuKategori.findMany({
        orderBy: [{ urutan: "asc" }, { nama: "asc" }],
        select: { id: true, nama: true, slug: true, urutan: true },
      }),
    ]);

    // Bentuk MenuItem (lihat data/menu.ts)
    const data = menus.map((m) => ({
      id: m.id,
      name: m.nama,
      category: m.kategoris[0]?.nama ?? null,
      kategoris: m.kategoris,
      kategoriIds: m.kategoris.map((k) => k.id),
      description: m.deskripsi,
      longDescription: m.deskripsiPanjang,
      price: m.harga,
      image: m.gambar,
    }));

    return NextResponse.json({ success: true, data, kategori });
  } catch (error) {
    console.error("[GET /api/menu]", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data menu" }, { status: 500 });
  }
}
