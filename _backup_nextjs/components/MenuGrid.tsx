"use client";

import MenuCard from "./MenuCard";
import type { MenuItem } from "@/data/menu";

type Props = {
  items: MenuItem[];
  getQty: (id: string | number) => number;
  onAdd: (item: MenuItem) => void;
  onInc: (id: string | number) => void;
  onDec: (id: string | number) => void;
};

export default function MenuGrid({ items, getQty, onAdd, onInc, onDec }: Props) {
  if (items.length === 0) {
    return (
      <div className="col-span-2 rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-black/5 sm:col-span-2 lg:col-span-3 xl:col-span-4">
        <div className="mx-auto max-w-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef6fb] text-xl">—</div>
          <h3 className="mt-4 text-sm font-bold text-[#1f2937]">Menu tidak ditemukan</h3>
          <p className="mt-1 text-sm text-[#6b7280]">Coba pilih kategori lain.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
          qty={getQty(item.id)}
          onAdd={() => onAdd(item)}
          onInc={() => onInc(item.id)}
          onDec={() => onDec(item.id)}
        />
      ))}
    </div>
  );
}
