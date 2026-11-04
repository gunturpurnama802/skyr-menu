// Bentuk data menu yang dikirim /api/menu ke halaman menu list.
export type MenuItem = {
  id: string;
  name: string;
  category: string | null;
  description: string;
  longDescription: string | null;
  price: number;
  image: string | null;
  kategoris?: { id: string; nama: string; slug: string }[];
  kategoriIds?: string[];
};

export function formatPrice(price: number) {
  // Jangan pakai Intl currency — di Node vs browser hasilnya beda (NBSP vs space)
  // yang bikin hydration mismatch: server "Rp 25.000" vs client "Rp25.000"
  // Format manual deterministik, sama di server & client.
  return `Rp ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
