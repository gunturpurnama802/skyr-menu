-- CreateTable
CREATE TABLE "Host" (
    "id" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "usia" INTEGER NOT NULL,
    "nomorWhatsapp" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "usernameTiktok" TEXT NOT NULL,
    "nomorRekening" TEXT,
    "namaPemilik" TEXT,
    "namaBank" TEXT,
    "konten" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Host_pkey" PRIMARY KEY ("id")
);
