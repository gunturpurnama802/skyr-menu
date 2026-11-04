// Buat / ganti password akun admin di database yang ditunjuk DATABASE_URL (.env).
// Pemakaian: npm run admin:password -- <username> <password-baru>
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const [username, password] = process.argv.slice(2);
if (!username || !password || password.length < 8) {
  console.error("Pemakaian: npm run admin:password -- <username> <password-baru (min. 8 karakter)>");
  process.exit(1);
}

const prisma = new PrismaClient();
try {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash },
    create: { username, passwordHash, role: "admin" },
  });
  const host = new URL(process.env.DATABASE_URL).host;
  console.log(`Password admin "${user.username}" diperbarui di ${host}`);
} finally {
  await prisma.$disconnect();
}
