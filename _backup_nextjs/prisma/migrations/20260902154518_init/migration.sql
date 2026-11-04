/*
  Warnings:

  - You are about to drop the `Host` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Host";

-- CreateTable
CREATE TABLE "menu_kategori" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "deskripsi_panjang" TEXT,
    "harga" INTEGER NOT NULL,
    "gambar" TEXT,
    "tersedia" BOOLEAN NOT NULL DEFAULT true,
    "kategori_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "menu_kategori_nama_key" ON "menu_kategori"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "menu_kategori_slug_key" ON "menu_kategori"("slug");

-- CreateIndex
CREATE INDEX "menu_kategori_id_idx" ON "menu"("kategori_id");

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "menu_kategori"("id") ON DELETE CASCADE ON UPDATE CASCADE;
