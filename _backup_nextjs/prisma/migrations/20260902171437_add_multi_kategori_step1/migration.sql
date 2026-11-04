-- DropForeignKey
ALTER TABLE "menu" DROP CONSTRAINT "menu_kategori_id_fkey";

-- AlterTable
ALTER TABLE "menu" ALTER COLUMN "kategori_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_MenuKategoris" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MenuKategoris_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MenuKategoris_B_index" ON "_MenuKategoris"("B");

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_kategori_id_fkey" FOREIGN KEY ("kategori_id") REFERENCES "menu_kategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuKategoris" ADD CONSTRAINT "_MenuKategoris_A_fkey" FOREIGN KEY ("A") REFERENCES "menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MenuKategoris" ADD CONSTRAINT "_MenuKategoris_B_fkey" FOREIGN KEY ("B") REFERENCES "menu_kategori"("id") ON DELETE CASCADE ON UPDATE CASCADE;
