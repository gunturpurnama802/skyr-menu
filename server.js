import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, "skyr.db");

// 1. Inisialisasi SQLite Database
const db = new DatabaseSync(DB_PATH);

// Buat tabel SQLite
db.exec(`
  CREATE TABLE IF NOT EXISTS menu_kategori (
    id TEXT PRIMARY KEY,
    nama TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    deskripsi TEXT,
    urutan INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS menu (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    deskripsi TEXT,
    deskripsi_panjang TEXT,
    harga INTEGER NOT NULL,
    gambar TEXT,
    tersedia INTEGER DEFAULT 1,
    urutan INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS menu_kategori_rel (
    menu_id TEXT NOT NULL,
    kategori_id TEXT NOT NULL,
    PRIMARY KEY (menu_id, kategori_id),
    FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE,
    FOREIGN KEY (kategori_id) REFERENCES menu_kategori(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS setting (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Seed data awal jika database masih kosong
const countKat = db.prepare("SELECT COUNT(*) as count FROM menu_kategori").get().count;
if (countKat === 0) {
  console.log("Seeding SQLite database awal...");
  const insertKat = db.prepare("INSERT INTO menu_kategori (id, nama, slug, urutan) VALUES (?, ?, ?, ?)");
  insertKat.run("k1", "Coffee", "coffee", 1);
  insertKat.run("k2", "Non-Coffee", "non-coffee", 2);
  insertKat.run("k3", "Snack", "snack", 3);

  const insertMenu = db.prepare(`
    INSERT INTO menu (id, nama, deskripsi, harga, gambar, tersedia, urutan)
    VALUES (?, ?, ?, ?, ?, 1, ?)
  `);
  const insertRel = db.prepare("INSERT INTO menu_kategori_rel (menu_id, kategori_id) VALUES (?, ?)");

  const initialItems = [
    { id: "m1", nama: "Americano", desk: "Espresso dengan air panas. Bold & clean.", harga: 18000, img: null, urut: 1, kat: "k1" },
    { id: "m2", nama: "Caffe Latte", desk: "Espresso dengan susu steamed. Creamy & smooth.", harga: 22000, img: null, urut: 2, kat: "k1" },
    { id: "m3", nama: "Cappuccino", desk: "Espresso, susu steamed, dan foam tebal klasik.", harga: 22000, img: null, urut: 3, kat: "k1" },
    { id: "m4", nama: "Es Kopi Susu Gula Aren", desk: "Kopi susu manis dengan gula aren asli SKYR. Favorit!", harga: 23000, img: null, urut: 4, kat: "k1" },
    { id: "m5", nama: "Matcha Latte", desk: "Matcha premium pilihan dengan susu segar.", harga: 25000, img: null, urut: 1, kat: "k2" },
    { id: "m6", nama: "Chocolate", desk: "Cokelat pekat premium yang rich dan creamy.", harga: 23000, img: null, urut: 2, kat: "k2" },
    { id: "m7", nama: "Lemon Tea", desk: "Teh segar berpadu perasan lemon asli.", harga: 15000, img: null, urut: 3, kat: "k2" },
    { id: "m8", nama: "French Fries", desk: "Kentang goreng gurih renyah dengan bumbu spesial.", harga: 18000, img: null, urut: 1, kat: "k3" },
    { id: "m9", nama: "Roti Bakar", desk: "Roti bakar krispi dengan selai dan cokelat/keju.", harga: 15000, img: null, urut: 2, kat: "k3" },
    { id: "m10", nama: "Pisang Goreng Keju", desk: "Pisang goreng manis dengan limpahan keju leleh.", harga: 16000, img: null, urut: 3, kat: "k3" },
  ];

  for (const item of initialItems) {
    insertMenu.run(item.id, item.nama, item.desk, item.harga, item.img, item.urut);
    insertRel.run(item.id, item.kat);
  }
}

// Sinkronkan data SQLite ke file statis data/menu.json
function syncJsonFile() {
  try {
    const jsonDir = path.join(__dirname, "data");
    if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir, { recursive: true });

    const kategori = db.prepare("SELECT id, nama, slug, urutan FROM menu_kategori ORDER BY urutan ASC, nama ASC").all();
    const menus = db.prepare("SELECT * FROM menu WHERE tersedia = 1 ORDER BY urutan ASC, nama ASC").all();

    const data = menus.map((m) => {
      const rels = db.prepare(`
        SELECT k.id, k.nama, k.slug 
        FROM menu_kategori k
        JOIN menu_kategori_rel r ON r.kategori_id = k.id
        WHERE r.menu_id = ?
      `).all(m.id);

      return {
        id: m.id,
        name: m.nama,
        category: rels[0]?.nama || null,
        kategoris: rels,
        kategoriIds: rels.map((k) => k.id),
        description: m.deskripsi || "",
        longDescription: m.deskripsi_panjang || null,
        price: m.harga,
        image: m.gambar || null,
      };
    });

    const output = { success: true, data, kategori };
    fs.writeFileSync(path.join(jsonDir, "menu.json"), JSON.stringify(output, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal sync menu.json:", err);
  }
}
syncJsonFile();

// MIME Types
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".mp3": "audio/mpeg",
};

// Web Server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API GET /api/menu (Mengambil langsung dari database SQLite)
  if (pathname === "/api/menu") {
    try {
      const kategori = db.prepare("SELECT id, nama, slug, urutan FROM menu_kategori ORDER BY urutan ASC, nama ASC").all();
      const menus = db.prepare("SELECT * FROM menu WHERE tersedia = 1 ORDER BY urutan ASC, nama ASC").all();

      const data = menus.map((m) => {
        const rels = db.prepare(`
          SELECT k.id, k.nama, k.slug 
          FROM menu_kategori k
          JOIN menu_kategori_rel r ON r.kategori_id = k.id
          WHERE r.menu_id = ?
        `).all(m.id);

        return {
          id: m.id,
          name: m.nama,
          category: rels[0]?.nama || null,
          kategoris: rels,
          kategoriIds: rels.map((k) => k.id),
          description: m.deskripsi || "",
          longDescription: m.deskripsi_panjang || null,
          price: m.harga,
          image: m.gambar || null,
        };
      });

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, data, kategori }));
    } catch (err) {
      console.error("[SQLite /api/menu Error]:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "Database error" }));
    }
    return;
  }

  // 2. API GET /api/setting/chat
  if (pathname === "/api/setting/chat") {
    try {
      const row = db.prepare("SELECT value FROM setting WHERE key = 'chat_room_url'").get();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, url: row ? row.value : null }));
    } catch {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true, url: null }));
    }
    return;
  }

  // 3. Static Files
  let filePath = path.join(__dirname, pathname === "/" ? "index.html" : pathname);

  // Jika file tidak ada, coba cek di public/
  if (!fs.existsSync(filePath)) {
    const publicCandidate = path.join(__dirname, "public", pathname);
    if (fs.existsSync(publicCandidate)) {
      filePath = publicCandidate;
    }
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 Not Found");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SKYR Pure HTML/CSS/JS + SQLite Server berjalan di http://localhost:${PORT}`);
});

